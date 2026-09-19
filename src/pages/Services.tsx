import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SERVICES } from '../data/services';
import { TrustRibbon } from '../components/TrustRibbon';
import { CtaBanner } from '../components/CtaBanner';

interface ServicesProps {
  onOpenCall: () => void;
}

export const Services: React.FC<ServicesProps> = ({ onOpenCall }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative bg-[#091b2f] text-white py-20 sm:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/hero-truck-loading.jpg?v=ai-20260919)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#091b2f]/70 to-[#091b2f]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#84d800]/20 text-[#84d800] rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Melbourne Junk Removal
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5">
            Our Services
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            From residential clearouts to commercial strip-outs, green waste, pianos, and spa removal — every service is handled by our local Melbourne crew.
          </p>
        </div>
      </div>

      <TrustRibbon />

      <section className="py-16 sm:py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1 text-center">
                  <h2 className="text-lg font-extrabold text-[#091b2f] group-hover:text-[#559400] transition-colors">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed line-clamp-3 flex-1">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[#091b2f]">
                    View service
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => navigate('/quote')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#84d800] hover:bg-[#76c700] text-white font-extrabold rounded-xl transition-colors"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <CtaBanner
        onQuoteClick={() => navigate('/quote')}
        onCallClick={onOpenCall}
      />
    </>
  );
};
