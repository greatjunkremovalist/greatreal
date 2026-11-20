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
    const photos = photoFilesRef.current.slice();
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
        photos,
      );
      photoFilesRef.current = [];
      setFormData((prev) => ({ ...prev, photos: [] }));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please enter your name, phone, and address.');
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
      className="relative w-full overflow-hidden bg-[#0b1524]"
      id="hero-section"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-0 sm:pt-0 pb-12 sm:pb-16 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-14 items-start">
          {/* Left: junk photo only behind this text area (not under the form) */}
          <div className="relative lg:col-span-5 overflow-hidden -mx-5 sm:-mx-8 lg:mx-0 lg:rounded-2xl">
            <div className="absolute inset-0">
              <img
                src="/images/hero-junk-pile.jpg?v=wa-20261121"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-[center_72%]"
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/50 to-black/65" />
            </div>

            <div
              className="relative z-10 text-white text-center lg:text-left space-y-7 sm:space-y-9 px-5 sm:px-8 lg:px-8 pt-10 sm:pt-14 pb-5 sm:pb-6 lg:py-10"
              style={{
                textShadow:
                  '0 2px 4px rgba(0,0,0,0.85), 0 4px 14px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.9)',
              }}
            >
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold tracking-[-0.02em] leading-[1.28]">
                Rubbish Removal<br className="hidden sm:block" /> Melbourne VIC
              </h1>
              <div className="space-y-6 sm:space-y-7 text-xl sm:text-2xl lg:text-[1.65rem] text-white font-bold leading-[1.55] max-w-xl mx-auto lg:mx-0">
                <p className="whitespace-nowrap text-[clamp(1.05rem,3.9vw,1.65rem)]">
                  Hassle-free low cost junk removal.
                </p>
                <p>Committed to zero to landfill.</p>
                <p className="leading-[1.55]">
                  All residential &amp; commercial rubbish removed in Melbourne VIC &amp; surrounding areas.
                </p>
              </div>
              <p
                className="text-[#84d800] font-black text-3xl sm:text-4xl tracking-tight leading-tight pt-1"
                style={{
                  textShadow:
                    '0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,1)',
                }}
              >
                From $99 all inclusive
              </p>
            </div>
          </div>

          {/* Right: quote form — solid bg, no photo behind it */}
          <div className="lg:col-span-7 lg:pl-2 mt-3 sm:mt-4 lg:mt-6 xl:mt-8" id="hero-quote">
            <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/30 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#84d800] via-[#6bb500] to-[#032b4c]" />

              <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-slate-100 bg-gradient-to-b from-[#f7faf5] to-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#559400]">
                      No obligation
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black text-[#091b2f] tracking-tight">
                      Get my free quote
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Tell us what to clear — we reply with a clear price.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#eaf8dd] border border-[#c5e89a]">
                    <Clock className="w-3.5 h-3.5 text-[#428400]" />
                    <span className="text-[11px] font-extrabold text-[#3d6c00] whitespace-nowrap">
                      ~1 min
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-6 sm:py-7">
                {submitted ? (
                  <div className="py-10 text-center space-y-4">
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
                      className="mt-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" id="hero-quote-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="hero-name">
                          Full name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-name"
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Jane Smith"
                            className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="hero-phone">
                          Phone number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="04XX XXX XXX"
                            className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="hero-email">
                          Email <span className="normal-case tracking-normal font-medium text-slate-400">(optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@email.com"
                            className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="hero-suburb">
                          Suburb / postcode
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            id="hero-suburb"
                            name="suburb"
                            type="text"
                            required
                            value={formData.suburb}
                            onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                            placeholder="Richmond, 3121"
                            className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="hero-service">
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
                        className="w-full px-4 py-3.5 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          paddingRight: '2.75rem',
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

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="hero-desc">
                        What would you like removed? <span className="normal-case tracking-normal font-medium text-slate-400">(optional)</span>
                      </label>
                      <textarea
                        id="hero-desc"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Old sofa, mattress, garage clutter"
                        className="w-full min-h-[96px] px-4 py-3.5 bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-xl text-sm text-[#091b2f] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#84d800]/50 focus:border-[#84d800] transition-all resize-y"
                      />
                    </div>

                    <div className="space-y-3 pt-1">
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
                        className="w-full py-4 sm:py-5 px-5 bg-[#eaf8dd] hover:bg-[#dff3c8] border-2 border-[#84d800] rounded-xl text-[#2f5a00] font-bold text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all shadow-[0_4px_14px_-4px_rgba(132,216,0,0.45)] ring-2 ring-[#84d800]/25"
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
                        <div className="flex flex-wrap gap-3">
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
                      className="group w-full flex items-center justify-center gap-2 py-4 px-5 bg-[#84d800] hover:bg-[#76c700] active:scale-[0.99] text-[#091a2e] font-black text-sm sm:text-base rounded-xl shadow-[0_8px_20px_-4px_rgba(132,216,0,0.55)] hover:shadow-[0_10px_24px_-4px_rgba(132,216,0,0.65)] transition-all disabled:opacity-75"
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
                    <p className="text-center text-slate-500 text-xs leading-relaxed pt-1">
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
