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

    const load = () => {
      fetch('/api/google-reviews', { cache: 'no-store' })
        .then((response) => response.json())
        .then((data: GoogleReviewsPayload) => {
          if (!cancelled && data && Array.isArray(data.reviews)) setPayload(data);
        })
        .catch(() => {
          if (!cancelled) setPayload(EMPTY);
        });
    };

    load();
    const timer = window.setInterval(load, 60000);
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [refreshKey]);

  return payload;
}
