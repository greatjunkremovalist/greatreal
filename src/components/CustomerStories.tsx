import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquareQuote,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
} from 'lucide-react';
import { CustomerStory } from '../types';
import { useGoogleReviews } from '../lib/useGoogleReviews';

const STORAGE_KEY = 'gjr_customer_stories_v3';
const AUTO_SLIDE_INTERVAL = 4500;

export const CustomerStories: React.FC = () => {
  const [stories, setStories] = useState<CustomerStory[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedStories, setExpandedStories] = useState<{ [id: string]: boolean }>({});

  const [formData, setFormData] = useState({
    authorName: '',
    suburb: '',
    serviceCategory: 'Residential Rubbish Removal',
    rating: 5,
    storyTitle: '',
    reviewText: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const google = useGoogleReviews();
  const visibleStories = useMemo(() => {
    return google.reviews.map((review): CustomerStory => ({
      id: review.id,
      authorName: review.authorName,
      suburb: 'Google review',
      serviceCategory: 'Google review',
      rating: review.rating,
      timeAgo: review.timeAgo,
      storyTitle: review.authorName,
      reviewText: review.text || 'Rated this business on Google.',
      initials:
        review.authorName
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'G',
      avatarBg: 'bg-blue-600',
      verified: true,
      avatarUrl: review.authorPhoto,
    }));
  }, [google.reviews]);

  useEffect(() => {
    if (visibleStories.length <= 1 || isModalOpen) return;
    const supportsHover =
      typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
    if (supportsHover && isHovered) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleStories.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [visibleStories.length, isHovered, isModalOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    } catch (e) {
      console.warn('Could not save customer stories', e);
    }
  }, [stories]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : visibleStories.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleStories.length);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName || !formData.reviewText) return;

    const initials =
      formData.authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CU';

    const newStory: CustomerStory = {
      id: `story-${Date.now()}`,
      authorName: formData.authorName,
      suburb: formData.suburb ? `${formData.suburb}, Melbourne` : 'Melbourne, VIC',
      serviceCategory: formData.serviceCategory,
      rating: formData.rating,
      timeAgo: 'Just now',
      storyTitle: formData.storyTitle || `${formData.serviceCategory} Review`,
      reviewText: formData.reviewText,
      highlight: 'Verified Melbourne Customer Story',
      avatarBg: 'bg-emerald-600',
      initials,
      verified: true,
    };

    setStories([newStory, ...stories]);
    setCurrentIndex(0);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsModalOpen(false);
      setFormData({
        authorName: '',
        suburb: '',
        serviceCategory: 'Residential Rubbish Removal',
        rating: 5,
        storyTitle: '',
        reviewText: '',
      });
    }, 1500);
  };

  const reviewCount = google.count;
  const avgRating = google.rating !== null ? google.rating.toFixed(1) : '–';

  return (
    <section className="w-full bg-[#f3f4f6] py-8 sm:py-10" id="reviews">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-[#2d3748] mb-5 sm:mb-6 tracking-tight">
          Melbourne Junk Removal{' '}
          <span className="text-[#84d800]">Customer Reviews</span>
        </h2>

        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-[#1a1d23] rounded-2xl p-4 sm:p-5 shadow-xl"
        >
          {/* Compact header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.25 21.36 7.31 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99Z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-semibold text-white leading-none">Reviews</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-white font-bold text-sm">{avgRating}</span>
                  <span className="text-[#fbbc04] text-xs">★★★★★</span>
                  <span className="text-slate-300 text-xs font-medium">
                    Total reviews: {reviewCount}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={google.writeReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 px-3.5 sm:px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-semibold rounded-full transition-colors"
            >
              Review us on Google
            </a>
          </div>

          {/* Reviews from Google only */}
          <div className="relative px-7 sm:px-9">
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#3a3f4b] hover:bg-[#4a5160] text-white flex items-center justify-center"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#3a3f4b] hover:bg-[#4a5160] text-white flex items-center justify-center"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              key={currentIndex}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 gjr-fade-slide"
            >
              {visibleStories.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-slate-300">
                  Google reviews will show here when customers leave them.
                </p>
              )}
              {Array.from({ length: Math.min(3, visibleStories.length) }, (_, offset) => {
                const story = visibleStories[(currentIndex + offset) % visibleStories.length];
                const isExpanded = expandedStories[story.id];
                const hide =
                  offset === 0 ? '' : offset === 1 ? 'hidden sm:flex' : 'hidden lg:flex';

                return (
                  <article
                    key={`${story.id}-${offset}`}
                    className={`${hide || 'flex'} flex-col bg-[#252830] rounded-xl p-3.5 sm:p-4`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="relative shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            story.avatarBg || 'bg-blue-600'
                          }`}
                        >
                          {story.initials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.25 21.36 7.31 24 12 24Z" />
                            <path fill="#FBBC05" d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.15Z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99Z" />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-xs sm:text-sm text-white truncate">
                            {story.authorName}
                          </span>
                          {story.verified && (
                            <svg className="w-3 h-3 fill-[#1a73e8] shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{story.timeAgo}</p>
                      </div>
                    </div>

                    <div className="text-xs tracking-wide mb-1">
                      <span className="text-[#fbbc04]">{'★★★★★'.slice(0, Math.round(story.rating || 5))}</span>
                      <span className="text-slate-600">{'★★★★★'.slice(Math.round(story.rating || 5))}</span>
                    </div>

                    <p
                      className={`text-xs text-slate-200 leading-relaxed ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {story.reviewText}
                    </p>

                    {story.reviewText.length > 90 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStories((prev) => ({
                            ...prev,
                            [story.id]: !prev[story.id],
                          }))
                        }
                        className="text-[#1a73e8] hover:text-blue-400 text-[11px] font-medium mt-1 self-start"
                      >
                        {isExpanded ? 'Less' : 'Read more'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-3.5">
            {visibleStories.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`rounded-full transition-all ${
                  currentIndex === idx ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Jump to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Share modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#84d800]/20 flex items-center justify-center text-[#559400]">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#091b2f]">Share Your Experience</h3>
                <p className="text-xs text-slate-700">Help fellow Melburnians choose with confidence</p>
              </div>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Thank you!</h4>
                <p className="text-xs text-slate-700">Your review has been added.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84d800]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Suburb</label>
                    <input
                      type="text"
                      placeholder="e.g. Hawthorn"
                      value={formData.suburb}
                      onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84d800]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service</label>
                    <select
                      value={formData.serviceCategory}
                      onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84d800] bg-white"
                    >
                      <option>Residential Rubbish Removal</option>
                      <option>Commercial Rubbish Removal</option>
                      <option>Construction Rubbish Removal</option>
                      <option>Deceased Estate Clearance</option>
                      <option>Piano Removal</option>
                      <option>Green Waste Removal</option>
                      <option>Spa & Hot Tub Removal</option>
                      <option>Clean Ups & Hoarder Support</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="cursor-pointer p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="Short headline"
                    value={formData.storyTitle}
                    onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84d800]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your review</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about your experience..."
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84d800]"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#84d800] hover:bg-[#77c900] text-[#091b2f] text-xs font-bold rounded-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
