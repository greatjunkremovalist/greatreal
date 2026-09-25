import { useEffect, useState } from 'react';
import { GoogleReviewsPayload, GOOGLE_MAPS_URL, GOOGLE_WRITE_REVIEW_URL } from './googlePlace';

const PUBLISHED_GOOGLE_REVIEWS: GoogleReviewsPayload = {
  ok: true,
  configured: true,
  rating: 5,
  count: 2,
  mapsUrl: GOOGLE_MAPS_URL,
  writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
  reviews: [
    {
      id: 'places/ChIJz4dwVMJL1moRa3AgGtIom4s/reviews/satyarth',
      authorName: 'Satyarth',
      authorPhoto:
        'https://lh3.googleusercontent.com/a/ACg8ocLEOb00PsCLxPWviL1rkHroMAlD0qbUCvRcdp-z8zryqQsMrw=s128-c0x00000000-cc-rp-mo',
      authorUrl: 'https://www.google.com/maps/contrib/117498970227203205571/reviews',
      rating: 5,
      text: 'good work',
      timeAgo: 'in the last week',
    },
  ],
};

export function useGoogleReviews(refreshKey = 0): GoogleReviewsPayload {
  const [payload, setPayload] = useState<GoogleReviewsPayload>(PUBLISHED_GOOGLE_REVIEWS);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch('/api/google-reviews', { cache: 'no-store' })
        .then((response) => response.json())
        .then((data: GoogleReviewsPayload) => {
          if (cancelled || !data || !Array.isArray(data.reviews)) return;
          if (data.reviews.length > 0) setPayload(data);
        })
        .catch(() => {
          // Keep the last Google reviews on screen if a refresh fails.
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
