const PLACE_ID = 'ChIJz4dwVMJL1moRa3AgGtIom4s';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=Great%20Junk%20Removalist&query_place_id=${PLACE_ID}`;
const WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  if (typeof res.status === 'function') {
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
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
      const message = data?.error?.status || data?.error?.message || 'places_failed';
      sendJson(res, 200, { ...emptyPayload(true), googleError: String(message).slice(0, 180) });
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

    sendJson(res, 200, {
      ok: true,
      configured: true,
      rating: typeof data?.rating === 'number' ? data.rating : null,
      count: Number(data?.userRatingCount) || reviews.length,
      mapsUrl: data?.googleMapsUri || MAPS_URL,
      writeReviewUrl: WRITE_REVIEW_URL,
      reviews,
    });
  } catch {
    sendJson(res, 200, emptyPayload(true));
  }
}
