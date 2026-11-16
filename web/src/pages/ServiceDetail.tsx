import React from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { getServiceBySlug, SERVICES } from '../data/services';
import { TrustRibbon } from '../components/TrustRibbon';
import { CtaBanner } from '../components/CtaBanner';
import { SeoHead } from '../components/SeoHead';

interface ServiceDetailProps {
  onOpenCall: () => void;
  setSelectedService?: (svc: string) => void;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({
  onOpenCall,
  setSelectedService,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  if (slug === 'residential-rubbish-removal') {
    return <Navigate to="/services/residential-rubbish-removal-in-melbourne" replace />;
  }

  const service = slug ? getServiceBySlug(slug) : undefined;

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const related = SERVICES.filter((s) => s.id !== service.id).slice(0, 3);

  const goQuote = () => {
    setSelectedService?.(service.quoteServiceValue);
    navigate('/quote');
  };

  return (
    <>
      <SeoHead
        title={`${service.title} Melbourne | Great Junk Removalist`}
        description={`${service.heroIntro} Book same-day ${service.shortTitle.toLowerCase()} rubbish removal across Melbourne. Call 0451 198 226.`}
      />

      {/* Hero */}
      <div className="relative bg-[#091b2f] text-white min-h-[380px] sm:min-h-[440px] flex items-end overflow-hidden">
        <img
          src={service.image}
          alt={`${service.title} Melbourne — junk and rubbish clearance by Great Junk Removalist`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091b2f] via-[#091b2f]/75 to-[#091b2f]/40" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-28">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 flex-wrap" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-[#84d800] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/services" className="hover:text-[#84d800] transition-colors">
              Services
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-semibold">{service.shortTitle}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-3xl">
            {service.title} in Melbourne
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            {service.heroIntro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goQuote}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#84d800] hover:bg-[#76c700] text-[#091b2f] font-extrabold rounded-xl transition-colors"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCall}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4 text-[#84d800]" />
              Call 0451 198 226
            </button>
          </div>
        </div>
      </div>

      <TrustRibbon />

      {/* Overview + includes */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091b2f]">
                About {service.shortTitle.toLowerCase()} rubbish removal in Melbourne
              </h2>
              {service.overview.map((para) => (
                <p key={para.slice(0, 32)} className="text-slate-800 text-base sm:text-lg leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#f4f9ef] border border-[#d8ebc8] p-6 sm:p-8">
                <h3 className="text-lg font-extrabold text-[#091b2f] mb-4">
                  What we can remove
                </h3>
                <ul className="space-y-3">
                  {service.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800">
                      <Check className="w-5 h-5 text-[#559400] stroke-[2.5] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-14 sm:py-16 bg-[#f8fafc] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091b2f] mb-8 text-center">
            {service.shortTitle} junk removal examples in Melbourne
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {service.gallery.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 shadow-sm"
              >
                <img
                  src={src}
                  alt={`${service.title} Melbourne example ${i + 1} — before and after junk clearance`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091b2f] mb-10 text-center">
            Why choose Great Junk Removalist for {service.shortTitle.toLowerCase()} removal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-slate-200 p-6 sm:p-7 bg-white shadow-sm"
              >
                <h3 className="text-lg font-extrabold text-[#091b2f] mb-2">{b.title}</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-14 sm:py-16 bg-[#091b2f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-10 text-center">
            How {service.shortTitle.toLowerCase()} rubbish removal works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {service.process.map((p) => (
              <div key={p.step} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <p className="text-[#84d800] text-xs font-extrabold uppercase tracking-wider mb-2">
                  {p.step}
                </p>
                <p className="text-base text-slate-200 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={goQuote}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#84d800] hover:bg-[#76c700] text-white font-extrabold rounded-xl transition-colors"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCall}
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call 0451 198 226
            </button>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-14 sm:py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-2xl font-extrabold text-[#091b2f]">Related Melbourne junk removal services</h2>
            <Link
              to="/services"
              className="text-sm font-bold text-[#559400] hover:text-[#091b2f] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((s) => (
              <Link
                key={s.id}
                to={`/services/${s.slug}`}
                className="group rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={s.image}
                    alt={`${s.title} Melbourne — related junk removal service`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-[#091b2f] group-hover:text-[#559400] transition-colors">
                    {s.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner onQuoteClick={goQuote} onCallClick={onOpenCall} />
    </>
  );
};
