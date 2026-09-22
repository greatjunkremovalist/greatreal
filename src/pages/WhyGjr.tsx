import React from 'react';
import { CustomerStories } from '../components/CustomerStories';
import { TrustRibbon } from '../components/TrustRibbon';
import { CtaBanner } from '../components/CtaBanner';
import { SeoHead } from '../components/SeoHead';
import { useNavigate } from 'react-router-dom';
import { Leaf, Clock, ThumbsUp } from 'lucide-react';

interface WhyGjrProps {
  onOpenCall: () => void;
}

export const WhyGjr: React.FC<WhyGjrProps> = ({ onOpenCall }) => {
  const navigate = useNavigate();

  return (
    <>
      <SeoHead
        title="Why Choose Great Junk Removalist Melbourne | About Us"
        description="Learn why Melbourne homes and businesses trust Great Junk Removalist for junk and rubbish removal — local crews, eco-friendly disposal, fixed quotes and same-day service."
      />

      <div className="relative text-white py-24 sm:py-32 bg-[#091b2f] flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/lounge-junk-before.jpg?v=sofa-pile-20260919"
            alt="Household furniture and clutter ready for Melbourne junk removal"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-[#091b2f]/80" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-md">
            Why Choose Great Junk Removalist Melbourne
          </h1>
          <p className="text-lg sm:text-2xl text-slate-100 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Melbourne&apos;s trusted junk and rubbish removal crew for homes, offices and estates — we do the heavy lifting, sort for recycling, and leave you completely clutter-free.
          </p>
        </div>
      </div>

      <TrustRibbon />

      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg text-slate-800 mx-auto">
            <h2 className="text-3xl font-extrabold text-[#091b2f] mb-6">
              Local Melbourne junk removal you can rely on
            </h2>
            <p className="mb-6">
              At <strong>Great Junk Removalist</strong>, we specialise in fast, all-inclusive{' '}
              <strong>rubbish removal Melbourne</strong> residents and businesses trust. Whether you are
              reclaiming a spare bedroom, clearing a garden after a storm, or managing a deceased estate,
              our two-person crew handles the heavy work from quote to final sweep-up.
            </p>
            <p className="mb-12">
              We built this business on <strong>reliability, transparent pricing, and hard work</strong>.
              When we say we&apos;ll be there, we&apos;re there. When we give a fixed volume-based quote, we stick to it — no hidden tip fees.
            </p>

            <h3 className="text-2xl font-extrabold text-[#091b2f] mb-6">
              What makes our junk removal different?
            </h3>
            <p className="mb-6">
              You have choices for Melbourne rubbish removal. Here is why clients book Great Junk Removalist again:
            </p>

            <ul className="space-y-6 mb-12 list-none pl-0">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#eaf8dd] text-[#74cb00] rounded-full mr-4 mt-1">
                  <ThumbsUp className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-[#091b2f] block text-xl mb-1">Local Melbourne operators</strong>
                  We are not a faceless franchise. Our local crews treat every home, backyard and office with the same care we would give our own — including upstairs, garages and under-house access.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#eaf8dd] text-[#74cb00] rounded-full mr-4 mt-1">
                  <Leaf className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-[#091b2f] block text-xl mb-1">Eco-friendly rubbish disposal</strong>
                  We sort every load so green waste can be composted, metals and e-waste are recycled, and usable items are donated whenever possible — diverting as much as we can from landfill.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#eaf8dd] text-[#74cb00] rounded-full mr-4 mt-1">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-[#091b2f] block text-xl mb-1">Same-day &amp; no-stress service</strong>
                  From the first call to the final sweep of your driveway, our goal is clutter-free living without you lifting a finger. Same-day and next-day junk removal slots are often available across Greater Melbourne.
                </div>
              </li>
            </ul>

            <h3 className="text-2xl font-extrabold text-[#091b2f] mb-6">
              More than just hauling rubbish
            </h3>
            <p className="mb-6">
              Whether we are helping a local business with an office strip-out or assisting a family with a garden overhaul, a clear space leads to a clearer mind — and we love being the Melbourne team that gets you there.
            </p>
            <p className="mb-6">
              Ready to clear the clutter? Call <strong>0451 198 226</strong> or request a free junk removal quote online.
            </p>
          </div>
        </div>
      </div>

      <div className="py-10 bg-slate-50 border-t border-slate-200">
        <CustomerStories />
      </div>

      <CtaBanner
        onQuoteClick={() => navigate('/quote')}
        onCallClick={onOpenCall}
      />
    </>
  );
};
