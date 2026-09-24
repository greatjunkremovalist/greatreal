import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  X,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  User,
  Mail,
  Camera,
} from 'lucide-react';
import { QuoteFormData } from '../types';
import { sendQuoteEmail } from '../lib/sendQuote';

interface HeroProps {
  selectedService?: string;
  onServiceSelect?: (service: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  selectedService = '',
  onServiceSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoFilesRef = useRef<File[]>([]);
  const [formData, setFormData] = useState<QuoteFormData>({
    fullName: '',
    phone: '',
    email: '',
    suburb: '',
    service: selectedService,
    description: '',
    photos: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    photoFilesRef.current = [...photoFilesRef.current, ...files];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, reader.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (indexToRemove: number) => {
    photoFilesRef.current = photoFilesRef.current.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      await sendQuoteEmail(
        {
          fullName: String(form.get('fullName') || ''),
          phone: String(form.get('phone') || ''),
          email: String(form.get('email') || ''),
          suburb: String(form.get('suburb') || ''),
          service: String(form.get('service') || ''),
          description: String(form.get('description') || ''),
          photos: [],
        },
        'Homepage quote form',
        photoFilesRef.current,
      );
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your quote request. Please call 0451 198 226.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    photoFilesRef.current = [];
    setSubmitted(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      suburb: '',
      service: '',
      description: '',
      photos: [],
    });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#032b4c]"
      id="hero-section"
    >
      {/* Background photo — stronger on the right, navy wash on the left for copy */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-truck-loading.jpg?v=ai-20260919"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#032b4c] from-[0%] via-[#032b4c] via-[46%] to-[#032b4c]/35 to-[72%] lg:to-[#032b4c]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#032b4c]/80 via-[#032b4c]/25 to-[#032b4c]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-8 items-center">
          {/* Left: brand message */}
          <div className="lg:col-span-5 text-white space-y-3.5 sm:space-y-4 lg:space-y-4 lg:pr-4">
            <p className="text-[#84d800] font-extrabold text-xs sm:text-sm tracking-[0.18em] uppercase">
              Melbourne Junk &amp; Rubbish Removal
            </p>
            <div className="space-y-1.5 lg:space-y-1">
              <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-none">
                Melbourne
              </h1>
              <p className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold text-white/95">
                We remove. You relax.
              </p>
            </div>
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-md font-medium">
              Same-day junk and rubbish removal for Melbourne homes, businesses and construction sites — furniture, appliances, green waste and renovation debris cleared.
            </p>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm sm:text-base text-slate-100 font-semibold">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84d800]" />
                Same-day options
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84d800]" />
                From $99 all-inclusive
              </li>
            </ul>

            <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-md font-medium">
              How it works: request a free quote → we confirm a time → our crew removes the junk and disposes of it responsibly. No need to stack anything on the nature strip.
            </p>
          </div>

          {/* Right: quote form */}
          <div className="lg:col-span-7 lg:pl-2" id="hero-quote">
            <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/30 overflow-hidden">
              {/* Accent strip — clipped to card radius via overflow-hidden */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#84d800] via-[#6bb500] to-[#032b4c]" />

              {/* Form header */}
              <div className="px-5 sm:px-6 lg:px-6 pt-4 sm:pt-5 lg:pt-4 pb-3 lg:pb-3 border-b border-slate-100 bg-gradient-to-b from-[#f7faf5] to-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#559400] mb-0.5">
                      No obligation
                    </p>
                    <h2 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-black text-[#091b2f] tracking-tight">
                      Get your free quote
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm lg:text-xs xl:text-sm text-slate-600">
                      Tell us what to clear — we reply with a clear price.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#eaf8dd] border border-[#c5e89a]">
                    <Clock className="w-3.5 h-3.5 text-[#428400]" />
                    <span className="text-[11px] font-extrabold text-[#3d6c00] whitespace-nowrap">
                      ~15 min
                    </span>
                  </div>
                </div>

              </div>

              <div className="px-5 sm:px-6 lg:px-6 py-4 sm:py-5 lg:py-4">
                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 bg-[#eaf8dd] text-[#559400] rounded-full mx-auto flex items-center justify-center ring-8 ring-[#f4f9ef]">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-xl font-black text-[#091b2f]">Quote request received</h3>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                      Thanks <span className="font-semibold text-slate-800">{formData.fullName || 'there'}</span>!
                      We&apos;ll call <span className="font-semibold text-slate-800">{formData.phone}</span> shortly
                      with your fixed price.
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-3 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-2.5" id="hero-quote-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="hero-name">
                          Full name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-name"
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Jane Smith"
                            className="w-full pl-10 pr-3.5 py-2.5 lg:py-2 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="hero-phone">
                          Phone number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="04XX XXX XXX"
                            className="w-full pl-10 pr-3.5 py-2.5 lg:py-2 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="hero-email">
                          Email <span className="normal-case tracking-normal font-medium text-slate-400">(optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@email.com"
                            className="w-full pl-10 pr-3.5 py-2.5 lg:py-2 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="hero-suburb">
                          Suburb / postcode
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-suburb"
                            name="suburb"
                            type="text"
                            required
                            value={formData.suburb}
                            onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                            placeholder="Richmond, 3121"
                            className="w-full pl-10 pr-3.5 py-2.5 lg:py-2 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="hero-service">
                        Service <span className="normal-case tracking-normal font-medium text-slate-400">(optional)</span>
                      </label>
                      <select
                        id="hero-service"
                        name="service"
                        value={formData.service}
                        onChange={(e) => {
                          setFormData({ ...formData, service: e.target.value });
                          onServiceSelect?.(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 lg:py-2 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.85rem center',
                          paddingRight: '2.5rem',
                        }}
                      >
                        <option value="">Select a service</option>
                        <option value="Residential Rubbish Removal">Residential Rubbish Removal</option>
                        <option value="Commercial Rubbish Removal">Commercial Rubbish Removal</option>
                        <option value="Construction Rubbish Removal">Construction Rubbish Removal</option>
                        <option value="Clean Ups">Clean Ups (NDIS, Estate, Hoarders)</option>
                        <option value="Piano Removal">Piano Removal</option>
                        <option value="Green Waste">Green Waste</option>
                        <option value="Metal Removal">Metal Removal</option>
                        <option value="Spa Removal">Spa Removal</option>
                        <option value="Cardboard Removal">Cardboard Removal</option>
                        <option value="General Rubbish">General Rubbish / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="hero-desc">
                        What would you like removed? <span className="normal-case tracking-normal font-medium text-slate-400">(optional)</span>
                      </label>
                      <textarea
                        id="hero-desc"
                        name="description"
                        rows={1}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Old sofa, mattress, garage clutter"
                        className="w-full min-h-[38px] max-h-[38px] px-3 py-2 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-lg text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all resize-none"
                      />
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="hero-photo-input"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 sm:py-4.5 px-4 bg-[#eaf8dd] hover:bg-[#dff3c8] border-2 border-[#84d800] rounded-xl text-[#2f5a00] font-bold text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 transition-all shadow-[0_4px_14px_-4px_rgba(132,216,0,0.45)] ring-2 ring-[#84d800]/25"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25]" />
                          Add photos of your junk
                        </span>
                        <span className="text-[#4d7a12] font-semibold text-xs sm:text-sm">
                          Helps us quote faster · Optional
                        </span>
                      </button>
                      {formData.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {formData.photos.map((photoUrl, idx) => (
                            <div
                              key={idx}
                              className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-[#84d800] shadow-md ring-2 ring-[#84d800]/20"
                            >
                              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute top-0.5 right-0.5 bg-[#091b2f]/80 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                                aria-label="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group w-full flex items-center justify-center gap-2 py-3 lg:py-2.5 px-5 bg-[#84d800] hover:bg-[#76c700] active:scale-[0.99] text-[#091a2e] font-black text-sm sm:text-base rounded-xl shadow-[0_8px_20px_-4px_rgba(132,216,0,0.55)] hover:shadow-[0_10px_24px_-4px_rgba(132,216,0,0.65)] transition-all disabled:opacity-75"
                    >
                      {loading ? (
                        'Sending your request...'
                      ) : (
                        <>
                          Get my free quote
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>

                    {error && (
                      <p className="text-center text-red-600 text-xs leading-relaxed" role="alert">
                        {error}
                      </p>
                    )}
                    <p className="text-center text-slate-500 text-[11px] leading-relaxed">
                      No spam. Local Melbourne crew. You&apos;ll only hear from us about this quote.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
