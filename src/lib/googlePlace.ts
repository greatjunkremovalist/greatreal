export const GOOGLE_PLACE_ID = 'ChIJz4dwVMJL1moRa3AgGtIom4s';

export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/AAQVdBognRGBHrte7';

export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

export interface GoogleReview {
  id: string;
  authorName: string;
  authorPhoto: string;
  authorUrl: string;
  rating: number;
  text: string;
  timeAgo: string;
}

export interface GoogleReviewsPayload {
  ok: boolean;
  configured: boolean;
  rating: number | null;
  count: number;
  mapsUrl: string;
  writeReviewUrl: string;
  reviews: GoogleReview[];
}
