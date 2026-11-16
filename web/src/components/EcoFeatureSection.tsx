import React from 'react';
import { CheckCircle2, Leaf } from 'lucide-react';

export const EcoFeatureSection: React.FC = () => {
  return (
    <section
      className="w-full bg-[#f8fafc] py-16 md:py-24 overflow-hidden border-t border-slate-100"
      id="eco-feature-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: content LEFT, circle RIGHT (opposite of section above). Mobile: circle then content. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Circle — first on mobile, second on desktop */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[560px] sm:max-w-[600px] lg:max-w-[640px] aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-[#84d800] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transform rotate-3 scale-[0.98] opacity-90 transition-transform duration-700 hover:rotate-0" />

              <div className="relative z-10 w-[94%] h-[94%] rounded-[36%_60%_68%_32%/38%_48%_58%_48%] overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <div className="grid grid-cols-2 w-full h-full gap-0.5 bg-white">
                  <div className="overflow-hidden">
                    <img
                      src="/images/garage-clean-before.jpg?v=ai-20260919"
                      className="w-full h-full object-cover object-[center_40%] transform group-hover:scale-105 transition-transform duration-700"
                      alt="Cluttered Melbourne garage before professional junk and rubbish removal"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <img
                      src="/images/garden-waste-before.jpg?v=ai-20260919"
                      className="w-full h-full object-cover object-[center_45%] transform group-hover:scale-105 transition-transform duration-700"
                      alt="Garden green waste pile for eco-friendly rubbish removal in Melbourne"
                    />
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#84d800] text-[#091b2f] font-extrabold px-4 py-2 rounded-full text-xs sm:text-sm shadow-xl flex items-center gap-2 border-2 border-white transform group-hover:scale-105 transition-transform duration-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Same-Day Junk Removal</span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 left-8 w-3 h-3 bg-[#84d800] rounded-full shadow" />
              <div className="absolute bottom-6 -right-2 w-4 h-4 bg-[#84d800] rounded-full shadow" />
              <div className="absolute top-1/2 -left-4 w-2.5 h-2.5 bg-[#84d800] rounded-full shadow" />
            </div>
          </div>

          {/* Content — second on mobile, first on desktop (left side) */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#091b2f] tracking-tight leading-tight">
              Garage, Garden &amp;{' '}
              <span className="text-[#6bb500]">Green Waste Removal</span>{' '}
              Melbourne
            </h2>

            <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
              Packed garages, storm-fallen branches, and yard bags — our Melbourne rubbish removal crew loads it all. Organic green waste goes to mulch recycling, and your driveway is swept clean before we leave.
            </p>

            <div className="space-y-4 pt-2">
              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Garage &amp; Shed Declutter</span>
                <span className="text-slate-800">
                  {' '}
                  – Mattresses, bikes, boxes, timber scraps, and years of buildup cleared in one junk removal visit.
                </span>
              </div>

              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Garden Green Waste</span>
                <span className="text-slate-800">
                  {' '}
                  – Branches, lawn bags, and storm debris hauled for eco-friendly Melbourne green waste disposal.
                </span>
              </div>

              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Book Today, Cleared Today</span>
                <span className="text-slate-800">
                  {' '}
                  – Same-day and next-day rubbish removal slots across Greater Melbourne when capacity allows.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-700 border-t border-slate-200/80">
              <Leaf className="w-4 h-4 text-[#6bb500] shrink-0" />
              <span>100% of collected Melbourne green waste is delivered to mulch recycling partners.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
