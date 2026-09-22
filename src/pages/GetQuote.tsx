import React from 'react';
import { QuoteSection } from '../components/QuoteSection';
import { TrustRibbon } from '../components/TrustRibbon';
import { SeoHead } from '../components/SeoHead';

interface GetQuoteProps {
  selectedService: string;
  setSelectedService: (svc: string) => void;
}

export const GetQuote: React.FC<GetQuoteProps> = ({ selectedService, setSelectedService }) => {
  return (
    <>
      <SeoHead
        title="Free Junk Removal Quote Melbourne | Great Junk Removalist"
        description="Request a free no-obligation junk and rubbish removal quote in Melbourne. Same-day options, all-inclusive pricing from $99. Call 0451 198 226."
      />

      <div className="bg-[#091b2f] pt-12 pb-24 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Free Junk Removal Quote Melbourne
          </h1>
          <p className="text-lg text-slate-200">
            Tell us what you need removed — furniture, green waste, construction debris or a full cleanout — and our Melbourne team will reply with a transparent, all-inclusive estimate. No obligation.
          </p>
        </div>
      </div>

      <div className="-mt-16">
        <QuoteSection
          selectedService={selectedService}
          onServiceSelect={(svc) => setSelectedService(svc)}
        />
      </div>

      <div className="pt-16">
        <TrustRibbon />
      </div>
    </>
  );
};
