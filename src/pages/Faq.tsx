import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TrustRibbon } from '../components/TrustRibbon';
import { CtaBanner } from '../components/CtaBanner';
import { SeoHead } from '../components/SeoHead';
import { useNavigate } from 'react-router-dom';
import { FAQS } from '../data/faqs';

interface FaqProps {
  onOpenCall: () => void;
}

export const Faq: React.FC<FaqProps> = ({ onOpenCall }) => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <SeoHead
        title="Junk Removal FAQs Melbourne | Great Junk Removalist"
        description="Answers to common questions about Melbourne junk and rubbish removal — same-day service, pricing, what we take, nature-strip rules and eco-friendly disposal."
      />

      <div className="bg-[#f8fafc] py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#091b2f] tracking-tight mb-4">
            Melbourne Junk Removal FAQs
          </h1>
          <p className="text-lg text-slate-800">
            Everything you need to know about our Melbourne junk and rubbish removal services, pricing and same-day bookings.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isOpen ? 'border-[#84d800] shadow-md' : 'border-slate-200 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-800 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#84d800] transform transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-800 leading-relaxed pt-2 border-t border-slate-100">
                    {faq.answer.split(/(0451 198 226)/g).map((part, partIndex) =>
                      part === '0451 198 226' ? (
                        <a
                          key={partIndex}
                          href="tel:0451198226"
                          className="font-semibold text-[#559400] underline underline-offset-2 hover:text-[#091b2f]"
                        >
                          {part}
                        </a>
                      ) : (
                        part
                      ),
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TrustRibbon />

      <CtaBanner
        onQuoteClick={() => navigate('/quote')}
        onCallClick={onOpenCall}
      />
    </>
  );
};
