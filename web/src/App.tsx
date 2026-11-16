import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CallModal } from './components/CallModal';
import { StickyCtaBar } from './components/StickyCtaBar';

import { Home } from './pages/Home';
import { WhyGjr } from './pages/WhyGjr';
import { Faq } from './pages/Faq';
import { GetQuote } from './pages/GetQuote';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { ViewPhotos } from './pages/ViewPhotos';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-[#84d800] selection:text-[#091b2f]">
        {/* Top Navigation */}
        <Navbar onOpenCall={() => setIsCallModalOpen(true)} />

        <div className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  onOpenCall={() => setIsCallModalOpen(true)}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                />
              } 
            />
            <Route
              path="/services"
              element={<Services onOpenCall={() => setIsCallModalOpen(true)} />}
            />
            <Route
              path="/services/:slug"
              element={
                <ServiceDetail
                  onOpenCall={() => setIsCallModalOpen(true)}
                  setSelectedService={setSelectedService}
                />
              }
            />
            <Route 
              path="/why-gjr" 
              element={<WhyGjr onOpenCall={() => setIsCallModalOpen(true)} />} 
            />
            <Route 
              path="/faq" 
              element={<Faq onOpenCall={() => setIsCallModalOpen(true)} />} 
            />
            <Route 
              path="/quote" 
              element={
                <GetQuote 
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                />
              } 
            />
            <Route 
              path="/blog" 
              element={<Blog onOpenCall={() => setIsCallModalOpen(true)} />} 
            />
            <Route
              path="/blog/:slug"
              element={<BlogPost onOpenCall={() => setIsCallModalOpen(true)} />}
            />
            <Route 
              path="/privacy-policy" 
              element={<PrivacyPolicy onOpenCall={() => setIsCallModalOpen(true)} />} 
            />
            <Route path="/view-photos" element={<ViewPhotos />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />

        {/* Call Dialog Modal */}
        <CallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
        />

        {/* Sticky bottom CTA bar */}
        <StickyCtaBar onOpenCall={() => setIsCallModalOpen(true)} />
      </div>
    </BrowserRouter>
  );
}
