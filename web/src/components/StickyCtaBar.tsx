import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ArrowUpRight } from 'lucide-react';

interface StickyCtaBarProps {
  onOpenCall: () => void;
}

export const StickyCtaBar: React.FC<StickyCtaBarProps> = ({ onOpenCall }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past the hero area
      setVisible(window.scrollY > 280);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reserve space only while the bar is showing (mobile only)
  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.classList.add('sticky-cta-visible');
    } else {
      root.classList.remove('sticky-cta-visible');
    }
    return () => root.classList.remove('sticky-cta-visible');
  }, [visible]);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(9,27,47,0.08)] pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      id="sticky-cta-bar"
      role="region"
      aria-label="Quick actions"
      aria-hidden={!visible}
    >
      <div className="px-3 py-3">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenCall}
            className="flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#091b2f] hover:bg-[#0d2438] text-white font-bold text-sm transition-colors active:scale-[0.99] cursor-pointer"
            id="sticky-call-btn"
          >
            <Phone className="w-[18px] h-[18px] stroke-[2.5] text-[#84d800]" />
            Call Us
          </button>

          <Link
            to="/quote"
            className="flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#84d800] hover:bg-[#76c700] text-white font-extrabold text-sm transition-colors active:scale-[0.99]"
            id="sticky-quote-btn"
          >
            Free Quote
            <ArrowUpRight className="w-[18px] h-[18px] stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
};
