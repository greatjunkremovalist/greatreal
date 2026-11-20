import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden" id="why-us-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Organic Shape with Official Great Junk Removalist Truck */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[560px] sm:max-w-[600px] lg:max-w-[640px] aspect-square flex items-center justify-center">
              
              {/* Vibrant Lime Green Organic Blob Background */}
              <div
                className="absolute inset-0 bg-[#84d800] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transform -rotate-3 scale-[0.98] opacity-90 transition-transform duration-700 hover:rotate-0"
              />

              {/* Card Inside Shape — two furniture / carpet photos only */}
              <div className="relative z-10 w-[94%] h-[94%] rounded-[36%_60%_68%_32%/38%_48%_58%_48%] overflow-hidden shadow-2xl border-4 border-white bg-white group">
                {/* Top / bottom stack so wide furniture photos aren't cut in half */}
                <div className="grid grid-rows-2 w-full h-full gap-0.5 bg-white">
                  <div className="overflow-hidden min-h-0">
                    <img
                      src="/images/lounge-junk-before.jpg?v=sofa-pile-20260919"
                      className="w-full h-full object-cover object-[center_60%] transform group-hover:scale-105 transition-transform duration-700"
                      alt="Sofa armchair carpet and TV on a Melbourne driveway ready for residential junk removal"
                    />
                  </div>
                  <div className="overflow-hidden min-h-0">
                    <img
                      src="/images/services-original/residential.jpg?v=wa-20261121"
                      className="w-full h-full object-cover object-[center_65%] transform group-hover:scale-105 transition-transform duration-700"
                      alt="Fridge mattress chairs and furniture ready for Melbourne household rubbish removal"
                    />
                  </div>
                </div>
                
                {/* Central Badge Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#84d800] text-[#091b2f] font-extrabold px-4 py-2 rounded-full text-xs sm:text-sm shadow-xl flex items-center gap-2 border-2 border-white transform group-hover:scale-105 transition-transform duration-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2-Person Team Included</span>
                  </div>
                </div>
              </div>

              {/* Decorative small green satellite dots */}
              <div className="absolute -top-3 right-8 w-3 h-3 bg-[#84d800] rounded-full shadow" />
              <div className="absolute bottom-6 -left-2 w-4 h-4 bg-[#84d800] rounded-full shadow" />
              <div className="absolute top-1/2 -right-4 w-2.5 h-2.5 bg-[#84d800] rounded-full shadow" />
            </div>
          </div>

          {/* Right Column: Copy & Bullet Points */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#091b2f] tracking-tight leading-tight">
              Fast, Reliable{' '}
              <span className="text-[#6bb500]">
                Rubbish &amp; Junk Removal
              </span>{' '}
              in Melbourne
            </h2>

            <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
              Reclaim your space the easy way. From old furniture and garden green waste to heavy renovation debris, our Melbourne junk removal team and purpose-built trucks handle all the heavy lifting. Fast, affordable, and eco-friendly—we make your rubbish disappear while you just point and relax.
            </p>

            {/* Benefit List with Truck & Labour Benefits */}
            <div className="space-y-4 pt-2">
              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Transparent Pricing</span>
                <span className="text-slate-800"> – Highly competitive all-inclusive rubbish removal rates across Melbourne with zero hidden dump fees or surprise costs.</span>
              </div>

              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Zero Effort Required</span>
                <span className="text-slate-800"> – Same-day junk removal dispatch with two uniformed professionals who do all the heavy loading and sweep up afterwards.</span>
              </div>

              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Purpose-Built Trucks</span>
                <span className="text-slate-800"> – Designed with low clearance to easily navigate narrow Melbourne driveways, car parks, and tight laneways.</span>
              </div>

              <div className="text-sm sm:text-base leading-snug">
                <span className="font-extrabold text-[#091b2f]">Eco-Conscious Disposal</span>
                <span className="text-slate-800"> – We actively sort metals, timber, e-waste, and donatable items on-truck to minimize our landfill footprint.</span>
              </div>
            </div>

            {/* Melbourne Guarantee Note */}
            <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100">
              <Shield className="w-4 h-4 text-[#6bb500] shrink-0" />
              <span>Fully licensed Melbourne junk removal crew, insured ($20M public liability), and environmentally certified across Greater Melbourne.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
