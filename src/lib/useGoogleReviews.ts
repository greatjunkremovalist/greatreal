import { useEffect, useState } from 'react';
import { GoogleReviewsPayload, GOOGLE_MAPS_URL, GOOGLE_WRITE_REVIEW_URL } from './googlePlace';

const PUBLISHED_GOOGLE_REVIEWS: GoogleReviewsPayload = {
  ok: true,
  configured: true,
  rating: 5,
  count: 12,
  mapsUrl: GOOGLE_MAPS_URL,
  writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
  reviews: [
    {
      id: 'google-himanshu-khanna',
      authorName: 'Himanshu Khanna',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: "I'm very happy with the service provided by Great Junk Removalist. The team was friendly, efficient, and professional, and the whole process was straightforward. Would definitely use them again.",
      timeAgo: '12 hours ago',
    },
    {
      id: 'google-arghaman-ali',
      authorName: 'Arghaman Ali',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'Very impressed with great junk removalist. The team was professional respectful And completed the job exactly as expected. I would happily recommend their services.',
      timeAgo: 'a day ago',
    },
    {
      id: 'google-jasman-khosa',
      authorName: 'jasman khosa',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'I had a great experience with great junk removalist. I highly recommended great junk removalist.',
      timeAgo: 'a day ago',
    },
    {
      id: 'google-a4dable-move',
      authorName: 'A4dable Move',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'Really happy with the service from Great Junk Removalist. Booking was easy, the team was professional, and the junk was removed quickly. A very smooth and hassle-free experience.',
      timeAgo: '2 days ago',
    },
    {
      id: 'google-vishal-batra',
      authorName: 'Vishal Batra',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'Great Junk Removalist provided excellent service. The team was friendly, professional, and easy to deal with. Everything was handled carefully and efficiently. Highly recommended. Thanks team.',
      timeAgo: '3 days ago',
    },
    {
      id: 'google-jahid-hasan',
      authorName: 'Jahid Hasan',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'Excellent service from Great Junk Removalist. Friendly and professional team, quick and efficient service, and everything was handled with care. Highly recommended!',
      timeAgo: '3 days ago',
    },
    {
      id: 'google-az-leon',
      authorName: 'AZ Leon',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'I had a great experience with Great Junk Removalist. The team was professional, reliable, and efficient. They made the whole process simple and hassle-free. Highly recommended!',
      timeAgo: '3 days ago',
    },
    {
      id: 'google-parvinder-singh',
      authorName: 'Parvinder Singh',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'I had a great experience with Great Junk Removalist. The team was professional, friendly, efficient, and made the entire process quick and hassle-free. They provided excellent service from start to finish, and I was very happy with the result. I highly recommend Great Junk Removalist to anyone looking for reliable and professional junk removal services.',
      timeAgo: '5 days ago',
    },
    {
      id: 'google-abhishek',
      authorName: 'Abhishek',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: "Absolutely fantastic service from the Great Junk Removalist team! The crew was extremely friendly, professional, and careful with everything. They completed the job efficiently and made the whole process easy and stress-free. I'm very happy with the service and would definitely recommend Great Junk Removalist to anyone looking for reliable, professional, and friendly junk removal services. Excellent work",
      timeAgo: 'a week ago',
    },
    {
      id: 'google-sanyam-rana',
      authorName: 'SANYAM RANA',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'Fantastic service from the team at Great Junk Removalist! They were fast, reliable, and super efficient with the rubbish collection. Highly recommend them to anyone needing quick and hassle-free junk removal!',
      timeAgo: 'a week ago',
    },
    {
      id: 'google-satyarth',
      authorName: 'Satyarth',
      authorPhoto:
        'https://lh3.googleusercontent.com/a/ACg8ocLEOb00PsCLxPWviL1rkHroMAlD0qbUCvRcdp-z8zryqQsMrw=s128-c0x00000000-cc-rp-mo',
      authorUrl: 'https://www.google.com/maps/contrib/117498970227203205571/reviews',
      rating: 5,
      text: 'good work',
      timeAgo: 'a week ago',
    },
    {
      id: 'google-tha-real-stories',
      authorName: 'Tha Real Stories',
      authorPhoto: '',
      authorUrl: GOOGLE_MAPS_URL,
      rating: 5,
      text: 'I had a great experience with Great Junk Removalist today. The crew was highly professional, punctual, efficient, and friendly throughout the entire job. They worked quickly as a team, handled everything with care, and made the whole process smooth and stress-free. I truly appreciate the excellent service and attention to detail. I would highly recommend Great Junk Removalist to anyone looking for a reliable and professional junk removal service.',
      timeAgo: 'a week ago',
    },
  ],
};

export function useGoogleReviews(refreshKey = 0): GoogleReviewsPayload {
  const [payload, setPayload] = useState<GoogleReviewsPayload>(PUBLISHED_GOOGLE_REVIEWS);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch('/api/google-reviews')
        .then((response) => response.json())
        .then((data: GoogleReviewsPayload) => {
          if (cancelled || !data || !Array.isArray(data.reviews) || data.reviews.length === 0) return;
          const liveNames = new Set(data.reviews.map((review) => review.authorName.toLowerCase()));
          const kept = PUBLISHED_GOOGLE_REVIEWS.reviews.filter(
            (review) => !liveNames.has(review.authorName.toLowerCase()),
          );
          setPayload({
            ...data,
            rating: data.rating ?? PUBLISHED_GOOGLE_REVIEWS.rating,
            count: data.count || PUBLISHED_GOOGLE_REVIEWS.count,
            reviews: [...data.reviews, ...kept],
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
