import { PUBLISHED_GOOGLE_REVIEWS } from '../src/data/publishedGoogleReviews.js';

const PLACE_ID = 'ChIJz4dwVMJL1moRa3AgGtIom4s';
const MAPS_URL = PUBLISHED_GOOGLE_REVIEWS.mapsUrl;
const WRITE_REVIEW_URL = PUBLISHED_GOOGLE_REVIEWS.writeReviewUrl;

const LIVE_TTL_MS = 6 * 60 * 60 * 1000;
const RETRY_TTL_MS = 15 * 60 * 1000;
let cachedPayload = null;
let cachedAt = 0;
let cacheTtl = LIVE_TTL_MS;

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

function mergeWithPublished(live) {
  const liveReviews = Array.isArray(live?.reviews) ? live.reviews : [];
  const liveNames = new Set(liveReviews.map((review) => String(review.authorName || '').toLowerCase()));
  const kept = PUBLISHED_GOOGLE_REVIEWS.reviews.filter(
    (review) => !liveNames.has(review.authorName.toLowerCase()),
  );
  const reviews = [...liveReviews, ...kept];
  return {
    ok: true,
    configured: true,
    rating: typeof live?.rating === 'number' ? live.rating : PUBLISHED_GOOGLE_REVIEWS.rating,
    count: Number(live?.count) || PUBLISHED_GOOGLE_REVIEWS.count,
    mapsUrl: live?.mapsUrl || MAPS_URL,
    writeReviewUrl: WRITE_REVIEW_URL,
    reviews,
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
  if (!response.ok) return null;
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

async function fetchPlacesLegacy(key) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews,url&language=en&key=${encodeURIComponent(key)}`;
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (data?.status !== 'OK') return null;
  const result = data.result || {};
  return {
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

  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  let live = null;
  if (key) {
    try {
      live = await fetchPlacesNew(key);
      if (!live || !live.reviews.length) {
        live = await fetchPlacesLegacy(key);
      }
    } catch {
      live = null;
    }
  }

  const hasLiveReviews = Boolean(live && live.reviews && live.reviews.length);
  cachedPayload = mergeWithPublished(live);
  cachedAt = Date.now();
  cacheTtl = hasLiveReviews ? LIVE_TTL_MS : RETRY_TTL_MS;
  sendJson(res, 200, cachedPayload, hasLiveReviews ? 21600 : 900);
}
