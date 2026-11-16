import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useGoogleReviews } from '../lib/useGoogleReviews';

interface GoogleReviewBadgeProps {
  placeId?: string;
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.25 21.36 7.31 24 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.15Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99Z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="tracking-wide" aria-label={`${filled} out of 5 stars`}>
      <span className="text-[#fbbc04]">{'★★★★★'.slice(0, filled)}</span>
      <span className="text-slate-300">{'★★★★★'.slice(filled)}</span>
    </span>
  );
}

export const GoogleReviewBadge: React.FC<GoogleReviewBadgeProps> = () => {
  const [open, setOpen] = useState(false);
  const google = useGoogleReviews(open ? 1 : 0);
  const displayRating = google.rating !== null ? google.rating.toFixed(1) : '0.0';
  const displayCount = google.count;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#121417] hover:bg-black text-white rounded-full shadow-lg transition-colors cursor-pointer border border-slate-800"
        id="work-google-reviews-badge"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <GoogleMark className="w-5 h-5" />
        <span className="font-bold text-white text-base">{displayRating}</span>
        <span className="text-[#f59e0b] text-base tracking-widest" aria-hidden>★★★★★</span>
        <span className="text-slate-400 text-sm font-medium">({displayCount})</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Google reviews"
            className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <GoogleMark className="h-7 w-7 shrink-0" />
                <div>
                  <p className="text-base font-semibold text-slate-900">Google reviews</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-600">
                    <span className="font-bold text-slate-900">{displayRating}</span>
                    <Stars rating={Number(displayRating)} />
                    <span>{displayCount} on Google</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close reviews"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-2">
              {google.reviews.length === 0 ? (
                <p className="py-8 text-center text-sm leading-relaxed text-slate-600">
                  Reviews left on the Great Junk Removalist Google Business page show up here. None are on that listing yet.
                </p>
              ) : (
                google.reviews.map((review) => (
                  <article key={review.id} className="border-b border-slate-100 py-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      {review.authorPhoto ? (
                        <img src={review.authorPhoto} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          {review.authorName.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <a href={review.authorUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:underline">
                          {review.authorName}
                        </a>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                          <Stars rating={review.rating} />
                          <span className="text-xs text-slate-400">{review.timeAgo}</span>
                        </p>
                      </div>
                    </div>
                    {review.text && <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.text}</p>}
                  </article>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">
              <a
                href={google.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1557b0]"
              >
                See all on Google
              </a>
              <a
                href={google.writeReviewUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Write a Google review
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
