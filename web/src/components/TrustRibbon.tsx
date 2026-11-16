import React from 'react';
import {
  Check,
  Leaf,
  Shield,
  Clock,
  Truck,
  Recycle,
  BadgeCheck,
  MapPin,
} from 'lucide-react';

const TRUST_ITEMS = [
  { id: 'fast', label: 'Fast junk removal', Icon: Check },
  { id: 'residential', label: 'Home & business rubbish', Icon: Check },
  { id: 'eco', label: 'Eco-friendly disposal', Icon: Leaf },
  { id: 'insured', label: 'Fully insured ($20M)', Icon: Shield },
  { id: 'sameday', label: 'Same-day Melbourne clearouts', Icon: Clock },
  { id: 'trucks', label: 'Purpose-built trucks', Icon: Truck },
  { id: 'recycle', label: 'Sorted for recycling', Icon: Recycle },
  { id: 'licensed', label: 'Licensed Melbourne crew', Icon: BadgeCheck },
  { id: 'suburbs', label: 'All Melbourne suburbs', Icon: MapPin },
  { id: 'pricing', label: 'Transparent all-inclusive pricing', Icon: Check },
] as const;

export const TrustRibbon: React.FC = () => {
  return (
    <section
      className="w-full bg-[#edf7e8] border-y border-[#dbeef0]/50 py-3 overflow-hidden"
      id="trust-ribbon"
    >
      <div
        className="gjr-marquee-track items-center gap-10 sm:gap-14 text-[#14341b] text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap"
        style={{ ['--gjr-marquee-duration' as string]: '45s' }}
        aria-label="Trust highlights"
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex items-center gap-10 sm:gap-14 pr-10 sm:pr-14 shrink-0"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {TRUST_ITEMS.map(({ id, label, Icon }) => (
              <div
                key={`${copy}-${id}`}
                className="flex items-center gap-1.5 sm:gap-2 shrink-0"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#438a06] stroke-[2.5] shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
