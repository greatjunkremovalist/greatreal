import React from 'react';
import { Hero } from '../components/Hero';
import { TrustRibbon } from '../components/TrustRibbon';
import { WorkShowcase } from '../components/WorkShowcase';
import { CustomerStories } from '../components/CustomerStories';
import { ServicesSection } from '../components/ServicesSection';
import { WhyUsSection } from '../components/WhyUsSection';
import { EcoFeatureSection } from '../components/EcoFeatureSection';
import { FaqSection } from '../components/FaqSection';
import { CtaBanner } from '../components/CtaBanner';
import { SeoHead } from '../components/SeoHead';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  onOpenCall: () => void;
  selectedService: string;
  setSelectedService: (svc: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenCall, selectedService, setSelectedService }) => {
  const navigate = useNavigate();

  const handleQuoteClick = () => {
    const el = document.getElementById('hero-quote');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      navigate('/quote');
    }
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    const el = document.getElementById('hero-quote');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      navigate('/quote');
    }
  };

  return (
    <>
      <SeoHead
        title="Great Junk Removalist Melbourne | Fast & Reliable Rubbish Removal"
        description="Fast, reliable junk and rubbish removal for homes, businesses, gardens and construction sites in Melbourne. Same day service, all-inclusive pricing from $99."
      />
      <Hero
        selectedService={selectedService}
        onServiceSelect={(svc) => setSelectedService(svc)}
      />
      <TrustRibbon />
      <WorkShowcase />
      <CustomerStories />
      <ServicesSection onSelectService={handleSelectService} />
      <WhyUsSection />
      <EcoFeatureSection />
      <FaqSection />
      <CtaBanner
        onQuoteClick={handleQuoteClick}
        onCallClick={onOpenCall}
      />
    </>
  );
};
