import { useEffect, useState } from 'react';
import { GoogleReviewsPayload, GOOGLE_MAPS_URL, GOOGLE_WRITE_REVIEW_URL } from './googlePlace';

const EMPTY: GoogleReviewsPayload = {
  ok: true,
  configured: false,
  rating: null,
  count: 0,
  mapsUrl: GOOGLE_MAPS_URL,
  writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
  reviews: [],
};

export function useGoogleReviews(refreshKey = 0): GoogleReviewsPayload {
  const [payload, setPayload] = useState<GoogleReviewsPayload>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/google-reviews')
      .then((response) => response.json())
      .then((data: GoogleReviewsPayload) => {
        if (!cancelled && data && Array.isArray(data.reviews)) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setPayload(EMPTY);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return payload;
}
