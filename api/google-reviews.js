import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { PUBLISHED_GOOGLE_REVIEWS } from '../src/data/publishedGoogleReviews.js';

dotenv.config();

const PLACE_ID = 'ChIJz4dwVMJL1moRa3AgGtIom4s';
const MAPS_URL = PUBLISHED_GOOGLE_REVIEWS.mapsUrl;
const WRITE_REVIEW_URL = PUBLISHED_GOOGLE_REVIEWS.writeReviewUrl;

const LIVE_TTL_MS = 6 * 60 * 60 * 1000;
const RETRY_TTL_MS = 30 * 60 * 1000;
let cachedPayload = null;
let cachedAt = 0;
let cacheTtl = LIVE_TTL_MS;
let tableReady = false;

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function sendJson(res, status, data, cacheSeconds = 300) {
  const body = JSON.stringify(data);
  const cacheControl = `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`;
  if (typeof res.status === 'function') {
    res.setHeader('Cache-Control', cacheControl);
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', cacheControl);
  res.end(body);
}

function mergeReviews(live) {
  const liveReviews = Array.isArray(live?.reviews) ? live.reviews : [];
  const liveNames = new Set(liveReviews.map((review) => String(review.authorName || '').toLowerCase()));
  const kept = PUBLISHED_GOOGLE_REVIEWS.reviews.filter(
    (review) => !liveNames.has(review.authorName.toLowerCase()),
  );
  return {
    ok: true,
    configured: true,
    rating: typeof live?.rating === 'number' ? live.rating : PUBLISHED_GOOGLE_REVIEWS.rating,
    count: Number(live?.count) || PUBLISHED_GOOGLE_REVIEWS.count,
    mapsUrl: live?.mapsUrl || MAPS_URL,
    writeReviewUrl: WRITE_REVIEW_URL,
    reviews: [...liveReviews, ...kept],
  };
}

async function ensureTable(sql) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS google_reviews_cache (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableReady = true;
}

async function readStoredReviews(sql) {
  if (!sql) return null;
  try {
    await ensureTable(sql);
    const rows = await sql`SELECT payload FROM google_reviews_cache WHERE id = 'current' LIMIT 1`;
    const payload = rows[0]?.payload;
    if (payload && Array.isArray(payload.reviews) && payload.reviews.length) return payload;
  } catch {
    return null;
  }
  return null;
}

async function storeReviews(sql, payload) {
  if (!sql || !payload?.reviews?.length) return;
  try {
    await ensureTable(sql);
    await sql`
      INSERT INTO google_reviews_cache (id, payload, updated_at)
      VALUES ('current', ${JSON.stringify(payload)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()
    `;
  } catch {
    // Keep serving reviews even if the cache table cannot be written.
  }
}

function mapNewReviews(data) {
  return {
    rating: typeof data?.rating === 'number' ? data.rating : null,
    count: Number(data?.userRatingCount) || 0,
    mapsUrl: data?.googleMapsUri || MAPS_URL,
    reviews: (Array.isArray(data?.reviews) ? data.reviews : []).map((review, index) => ({
      id: review.name || review.publishTime || `google-review-${index}`,
      authorName: review.authorAttribution?.displayName || 'Google reviewer',
      authorPhoto: review.authorAttribution?.photoUri || '',
      authorUrl: review.authorAttribution?.uri || MAPS_URL,
      rating: Number(review.rating) || 5,
      text: review.text?.text || review.originalText?.text || '',
      timeAgo: review.relativePublishTimeDescription || '',
    })),
  };
}

async function fetchPlacesNew(key) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
    },
  });
  const data = await response.json().catch(() => null);
  const status = data?.error?.status || '';
  if (response.status === 429 || status === 'RESOURCE_EXHAUSTED') {
    return { exhausted: true, live: null };
  }
  if (!response.ok) return { exhausted: false, live: null };
  return { exhausted: false, live: mapNewReviews(data) };
}

async function fetchPlacesLegacy(key) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews,url&language=en&reviews_sort=newest&key=${encodeURIComponent(key)}`;
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (data?.status === 'OVER_QUERY_LIMIT' || data?.status === 'RESOURCE_EXHAUSTED') {
    return { exhausted: true, live: null };
  }
  if (data?.status !== 'OK') return { exhausted: false, live: null };
  const result = data.result || {};
  return {
    exhausted: false,
    live: {
      rating: typeof result.rating === 'number' ? result.rating : null,
      count: Number(result.user_ratings_total) || 0,
      mapsUrl: result.url || MAPS_URL,
      reviews: (Array.isArray(result.reviews) ? result.reviews : []).map((review, index) => ({
        id: review.time ? `google-legacy-${review.time}` : `google-legacy-${index}`,
        authorName: review.author_name || 'Google reviewer',
        authorPhoto: review.profile_photo_url || '',
        authorUrl: review.author_url || MAPS_URL,
        rating: Number(review.rating) || 5,
        text: review.text || '',
        timeAgo: review.relative_time_description || '',
      })),
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  if (cachedPayload && Date.now() - cachedAt < cacheTtl) {
    sendJson(res, 200, cachedPayload, Math.max(60, Math.round(cacheTtl / 1000)));
    return;
  }

  const sql = database();
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  let live = null;
  let exhausted = false;

  if (key) {
    try {
      const newest = await fetchPlacesNew(key);
      exhausted = Boolean(newest.exhausted);
      live = newest.live;
      if ((!live || !live.reviews.length) && !exhausted) {
        const legacy = await fetchPlacesLegacy(key);
        exhausted = Boolean(legacy.exhausted);
        live = legacy.live;
      }
    } catch {
      live = null;
    }
  }

  const hasLiveReviews = Boolean(live && live.reviews && live.reviews.length);
  let payload = hasLiveReviews ? mergeReviews(live) : null;

  if (hasLiveReviews) {
    await storeReviews(sql, payload);
  } else {
    payload = await readStoredReviews(sql);
    if (!payload) {
      payload = mergeReviews(null);
      await storeReviews(sql, payload);
    }
  }

  cachedPayload = payload;
  cachedAt = Date.now();
  cacheTtl = hasLiveReviews ? LIVE_TTL_MS : RETRY_TTL_MS;
  sendJson(res, 200, payload, hasLiveReviews ? 21600 : 900);
}
