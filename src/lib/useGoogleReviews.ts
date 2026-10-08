import { useEffect, useState } from 'react';
import { GoogleReviewsPayload } from './googlePlace';
import { PUBLISHED_GOOGLE_REVIEWS } from '../data/publishedGoogleReviews.js';

export function useGoogleReviews(refreshKey = 0): GoogleReviewsPayload {
  const [payload, setPayload] = useState<GoogleReviewsPayload>(PUBLISHED_GOOGLE_REVIEWS);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch('/api/google-reviews')
        .then((response) => response.json())
        .then((data: GoogleReviewsPayload) => {
          if (cancelled || !data) return;
          const liveReviews = Array.isArray(data.reviews) ? data.reviews : [];
          const liveNames = new Set(liveReviews.map((review) => review.authorName.toLowerCase()));
          const kept = PUBLISHED_GOOGLE_REVIEWS.reviews.filter(
            (review) => !liveNames.has(review.authorName.toLowerCase()),
          );
          setPayload({
            ...data,
            ok: true,
            configured: true,
            rating: data.rating ?? PUBLISHED_GOOGLE_REVIEWS.rating,
            count: data.count || PUBLISHED_GOOGLE_REVIEWS.count,
            reviews: [...liveReviews, ...kept],
          });
        })
        .catch(() => {
          // Keep the last Google reviews on screen if a refresh fails.
        });
    };

    load();
    const timer = window.setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refreshKey]);

  return payload;
}
