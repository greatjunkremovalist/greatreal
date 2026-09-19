import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { SERVICES, type ServicePage } from '../data/services';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

const byId = (id: string) => SERVICES.find((s) => s.id === id)!;

/** Section 1 — Residential first (manual slide only) */
const SECTION_1 = [
  byId('residential'),
  byId('construction'),
  byId('deceased-estate'),
];

/** Section 2 — Commercial first */
const SECTION_2 = [
  byId('commercial'),
  byId('piano-removal'),
  byId('metal-removal'),
];

/** Section 3 — Green Waste first */
const SECTION_3 = [
  byId('green-waste'),
  byId('spa-removal'),
  byId('cardboard-removal'),
  byId('clean-ups'),
];

const ServiceCardItem: React.FC<{
  card: ServicePage;
  onSelectService: (serviceName: string) => void;
  instanceId?: string;
}> = ({ card, onSelectService, instanceId }) => (
  <div
    className="snap-start flex-none w-[280px] sm:w-[310px] md:w-[330px] bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.14)] transition-shadow duration-300 flex flex-col justify-between group"
    id={instanceId ? `service-card-${instanceId}` : `service-card-${card.id}`}
  >
    <Link to={`/services/${card.slug}`} className="block w-full relative overflow-hidden bg-slate-100 aspect-[16/11]">
      <img
        src={card.image}
        alt={card.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        loading="lazy"
        width={960}
        height={660}
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
    </Link>

    <div className="p-6 sm:p-7 flex flex-col justify-between items-center text-center flex-1">
      <div>
        <Link to={`/services/${card.slug}`}>
          <h3 className="text-lg sm:text-xl font-black text-[#091b2f] group-hover:text-[#559400] transition-colors leading-snug">
            {card.title}
          </h3>
        </Link>
        <p className="mt-3 text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal">
          {card.description}
        </p>
      </div>

      <div className="mt-6 pt-2 w-full flex flex-col gap-2">
        <Link
          to={`/services/${card.slug}`}
          className="w-full min-w-[150px] px-6 py-2.5 bg-[#84d800] hover:bg-[#76c700] active:scale-[0.98] text-[#091b2f] font-black text-xs uppercase tracking-wider rounded shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>{card.buttonLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-1 transition-transform" />
        </Link>
        <button
          type="button"
          onClick={() => onSelectService(card.quoteServiceValue)}
          className="text-xs font-bold text-slate-600 hover:text-[#559400] underline underline-offset-2 transition-colors"
        >
          Get a free quote
        </button>
      </div>
    </div>
  </div>
);

interface ServiceCarouselProps {
  id: string;
  title: string;
  cards: ServicePage[];
  onSelectService: (serviceName: string) => void;
  /** When false, user slides manually (no marquee) */
  autoScroll?: boolean;
}

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({
  id,
  title,
  cards,
  onSelectService,
  autoScroll = true,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const durationSec = Math.max(24, cards.length * 8);

  const slideManual = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth > 768 ? 360 : 300;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const nudgeMarquee = () => {
    setIsPaused(true);
    window.setTimeout(() => setIsPaused(false), 2800);
  };

  return (
    <div
      className="mb-12 sm:mb-14 last:mb-0"
      id={id}
      onMouseEnter={() => autoScroll && setIsPaused(true)}
      onMouseLeave={() => autoScroll && setIsPaused(false)}
      onFocusCapture={() => autoScroll && setIsPaused(true)}
      onBlurCapture={(e) => {
        if (autoScroll && !e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#559400]">
          {title}
        </h3>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => (autoScroll ? nudgeMarquee() : slideManual('left'))}
            aria-label={`${title} previous`}
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white text-[#091b2f] border-slate-300 hover:bg-[#84d800] hover:border-[#84d800] shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => (autoScroll ? nudgeMarquee() : slideManual('right'))}
            aria-label={`${title} next`}
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-[#091b2f] text-white border-[#091b2f] hover:bg-[#84d800] hover:border-[#84d800] hover:text-[#091b2f] shadow-sm"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {autoScroll ? (
        <div className="relative overflow-hidden mask-[linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
          <div
            ref={trackRef}
            className={`gjr-marquee-track py-4 ${isPaused ? 'is-paused' : ''}`}
            style={{ ['--gjr-marquee-duration' as string]: `${durationSec}s` }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex gap-6 pr-6 shrink-0"
                aria-hidden={copy === 1 ? true : undefined}
              >
                {cards.map((card) => (
                  <ServiceCardItem
                    key={`${id}-${copy}-${card.id}`}
                    card={card}
                    instanceId={`${id}-${copy}-${card.id}`}
                    onSelectService={onSelectService}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative max-w-full overflow-x-hidden">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory py-4 px-1 max-w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((card) => (
              <ServiceCardItem
                key={card.id}
                card={card}
                onSelectService={onSelectService}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section
      className="w-full bg-[#f8fafc] py-16 sm:py-20 lg:py-24 border-t border-slate-200/80 relative overflow-x-hidden"
      id="services"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="max-w-3xl mb-10 sm:mb-12 overflow-visible">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#84d800]/15 text-[#3d6c00] rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#559400]" />
            <span>All 10 Specialised Services</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#091b2f] tracking-tight">
            Our Full Range of <span className="text-[#559400]">Services</span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-800 leading-relaxed break-words">
            Browse{' '}
            <span className="font-semibold text-[#091b2f]">residential</span>,{' '}
            <span className="font-semibold text-[#091b2f]">commercial</span>, and{' '}
            <span className="font-semibold text-[#091b2f]">green waste</span> services.
            Tap any card for full details, or use the arrows to slide through each row.
          </p>
        </div>

        <ServiceCarousel
          id="services-residential"
          title="Residential Services"
          cards={SECTION_1}
          onSelectService={onSelectService}
          autoScroll={false}
        />

        <ServiceCarousel
          id="services-commercial"
          title="Commercial Services"
          cards={SECTION_2}
          onSelectService={onSelectService}
          autoScroll={false}
        />

        <ServiceCarousel
          id="services-green-waste"
          title="Green Waste & More"
          cards={SECTION_3}
          onSelectService={onSelectService}
          autoScroll={false}
        />

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#091b2f] hover:bg-[#0d2744] text-white font-bold text-sm rounded-xl transition-colors"
          >
            View all services
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => onSelectService('General Rubbish')}
            className="text-[#091b2f] font-bold text-sm underline hover:text-[#559400] transition cursor-pointer"
          >
            Get a custom instant estimate →
          </button>
        </div>
      </div>
    </section>
  );
};
