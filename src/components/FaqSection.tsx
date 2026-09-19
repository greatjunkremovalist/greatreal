import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../data/faqs';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="w-full bg-white py-16 sm:py-20 lg:py-24 border-t border-slate-200/80"
      id="faq"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#559400] mb-3">
            FAQs
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#091b2f] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
            Everything you need to know about our Melbourne junk removal services.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`bg-[#f8fafc] border rounded-xl overflow-hidden transition-all ${
                  isOpen ? 'border-[#84d800] shadow-md' : 'border-slate-200 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#84d800] focus-visible:ring-inset"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-[#091b2f] pr-4 text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#84d800] transform transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  className={`px-5 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-700 leading-relaxed pt-2 border-t border-slate-200/80 text-sm sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#091b2f] hover:text-[#559400] transition-colors"
          >
            View all FAQs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
