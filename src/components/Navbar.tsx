import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { ArrowUpRight, Menu, X, Phone, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SERVICES } from '../data/services';

interface NavbarProps {
  onOpenCall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCall }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isServicesActive =
    location.pathname === '/services' || location.pathname.startsWith('/services/');

  const linkClass = (path: string) =>
    `font-semibold text-sm transition-colors ${isActive(path) ? 'text-[#74cb00]' : 'text-slate-700 hover:text-[#74cb00]'}`;

  const mobileLinkClass = (path: string) =>
    `block px-3 py-2 rounded-md font-medium transition-colors ${isActive(path) ? 'text-[#74cb00] bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-[#74cb00]'}`;

  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Logo size="md" showTagline={false} />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8" id="desktop-nav">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>

            {/* Services dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setServicesOpen((o) => !o)}
                onMouseEnter={() => setServicesOpen(true)}
                className={`inline-flex items-center gap-1 font-semibold text-sm transition-colors ${
                  isServicesActive ? 'text-[#74cb00]' : 'text-slate-700 hover:text-[#74cb00]'
                }`}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Services
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {servicesOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[320px] z-50"
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <Link
                        to="/services"
                        onClick={() => setServicesOpen(false)}
                        className="text-xs font-extrabold uppercase tracking-wider text-[#559400] hover:text-[#091b2f] transition-colors"
                      >
                        View all services →
                      </Link>
                    </div>
                    <ul className="max-h-[70vh] overflow-y-auto py-1.5">
                      {SERVICES.map((svc) => (
                        <li key={svc.id}>
                          <Link
                            to={`/services/${svc.slug}`}
                            onClick={() => setServicesOpen(false)}
                            className={`block px-4 py-2.5 text-sm font-semibold transition-colors ${
                              location.pathname === `/services/${svc.slug}`
                                ? 'text-[#74cb00] bg-[#f4f9ef]'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-[#74cb00]'
                            }`}
                          >
                            {svc.navLabel}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <Link to="/why-gjr" className={linkClass('/why-gjr')}>
              Why GJR
            </Link>
            <Link to="/faq" className={linkClass('/faq')}>
              FAQ
            </Link>
            <Link to="/quote" className={linkClass('/quote')}>
              Get Quote
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/quote"
              className="text-[#0a1c32] hover:text-[#74cb00] font-bold text-sm transition-colors"
            >
              Book Now
            </Link>
            <button
              onClick={onOpenCall}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#84d800] hover:bg-[#77c900] active:scale-[0.98] text-[#0a1c32] font-bold text-sm rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
              id="header-call-btn"
            >
              <span>Call Us</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenCall}
              className="p-2 bg-[#84d800] text-[#0a1c32] rounded-lg"
              title="Call Us"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/')}>
            Home
          </Link>

          <div>
            <button
              type="button"
              onClick={() => setMobileServicesOpen((o) => !o)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                isServicesActive
                  ? 'text-[#74cb00] bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#74cb00]'
              }`}
            >
              Services
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileServicesOpen && (
              <div className="ml-2 mt-1 mb-2 border-l-2 border-[#84d800]/40 pl-2 space-y-0.5">
                <Link
                  to="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-[#559400] rounded-md hover:bg-slate-50"
                >
                  All Services
                </Link>
                {SERVICES.map((svc) => (
                  <Link
                    key={svc.id}
                    to={`/services/${svc.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      location.pathname === `/services/${svc.slug}`
                        ? 'text-[#74cb00] bg-slate-50 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#74cb00]'
                    }`}
                  >
                    {svc.shortTitle}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/why-gjr"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/why-gjr')}
          >
            Why GJR
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/faq')}
          >
            FAQ
          </Link>
          <Link
            to="/quote"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/quote')}
          >
            Get Quote
          </Link>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCall();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#84d800] text-[#0a1c32] font-bold rounded-lg shadow"
            >
              <span>Call Us: 1300 586 573</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
