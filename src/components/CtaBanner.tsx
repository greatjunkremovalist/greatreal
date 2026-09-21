import React from 'react';
import banner2Image from '../assets/images/banner_2.png';

interface CtaBannerProps {
  onQuoteClick: () => void;
  onCallClick?: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onQuoteClick, onCallClick }) => {
  const handleCall = () => {
    if (onCallClick) {
      onCallClick();
    } else {
      window.location.href = 'tel:0451198226';
    }
  };

  return (
    <section
      className="relative w-full bg-[#07192d] overflow-hidden border-t border-slate-800"
      id="bottom-cta-banner"
    >
      <div className="relative w-full max-w-[2170px] mx-auto">
        <div className="relative w-full">
          <img
            src={banner2Image}
            alt="Ready to clear the junk? Get your quote today."
            className="w-full h-auto block select-none pointer-events-none"
            loading="lazy"
          />

          {/* Hotspots matching Digima banner button positions */}
          <button
            type="button"
            onClick={onQuoteClick}
            className="absolute left-[54%] top-[58%] w-[20%] h-[22%] sm:left-[55%] sm:top-[60%] sm:w-[18%] sm:h-[18%] md:left-[56%] md:top-[62%] md:w-[16%] md:h-[16%] cursor-pointer rounded-md border-0 bg-transparent z-10"
            aria-label="Get a Quote"
            id="cta-get-quote-btn"
          />

          <button
            type="button"
            onClick={handleCall}
            className="absolute left-[75%] top-[58%] w-[18%] h-[22%] sm:left-[74%] sm:top-[60%] sm:w-[16%] sm:h-[18%] md:left-[74%] md:top-[62%] md:w-[14%] md:h-[16%] cursor-pointer rounded-md border-0 bg-transparent z-10"
            aria-label="Call Us"
            id="cta-call-us-btn"
          />
        </div>
      </div>
    </section>
  );
};
