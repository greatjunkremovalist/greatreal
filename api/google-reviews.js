const PLACE_ID = 'ChIJz4dwVMJL1moRa3AgGtIom4s';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=Great%20Junk%20Removalist&query_place_id=${PLACE_ID}`;
const WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

const OK_TTL_MS = 6 * 60 * 60 * 1000;
const FAIL_TTL_MS = 6 * 60 * 60 * 1000;
let cachedPayload = null;
let cachedAt = 0;
let blockedUntil = 0;

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

function emptyPayload(configured) {
  return {
    ok: true,
    configured,
    rating: null,
    count: 0,
    mapsUrl: MAPS_URL,
    writeReviewUrl: WRITE_REVIEW_URL,
    reviews: [],
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  if (cachedPayload && Date.now() - cachedAt < OK_TTL_MS) {
    sendJson(res, 200, cachedPayload, 21600);
    return;
  }

  if (Date.now() < blockedUntil) {
    sendJson(res, 200, emptyPayload(true), 21600);
    return;
  }

  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    sendJson(res, 200, emptyPayload(false));
    return;
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      blockedUntil = Date.now() + FAIL_TTL_MS;
      sendJson(res, 200, emptyPayload(true), 21600);
      return;
    }

    const reviews = (Array.isArray(data?.reviews) ? data.reviews : [])
      .map((review, index) => ({
        id: review.name || review.publishTime || `google-review-${index}`,
        authorName: review.authorAttribution?.displayName || 'Google reviewer',
        authorPhoto: review.authorAttribution?.photoUri || '',
        authorUrl: review.authorAttribution?.uri || MAPS_URL,
        rating: Number(review.rating) || 5,
        text: review.text?.text || review.originalText?.text || '',
        timeAgo: review.relativePublishTimeDescription || '',
      }));

    cachedPayload = {
      ok: true,
      configured: true,
      rating: typeof data?.rating === 'number' ? data.rating : null,
      count: Number(data?.userRatingCount) || reviews.length,
      mapsUrl: data?.googleMapsUri || MAPS_URL,
      writeReviewUrl: WRITE_REVIEW_URL,
      reviews,
    };
    cachedAt = Date.now();
    sendJson(res, 200, cachedPayload, 21600);
  } catch {
    blockedUntil = Date.now() + FAIL_TTL_MS;
    sendJson(res, 200, emptyPayload(true), 21600);
  }
}
