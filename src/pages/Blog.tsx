import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { CtaBanner } from '../components/CtaBanner';
import { SeoHead } from '../components/SeoHead';

const blogPosts = [
  {
    id: 1,
    title: 'How to Prepare for a Deceased Estate Clearance in Melbourne',
    excerpt:
      'Clearing a deceased estate in Melbourne is emotional and overwhelming. Here are practical steps before your junk removal team arrives for a compassionate house clearance.',
    date: 'Aug 15, 2026',
    category: 'Estate Clearance',
    image: '/images/office-clear-before.jpg?v=ai-20260919',
    imageAlt: 'Office and household items ready for deceased estate clearance in Melbourne',
  },
  {
    id: 2,
    title: 'Where Does Your Melbourne Rubbish Actually Go?',
    excerpt:
      'Ever wondered what happens after a junk removal truck leaves? Learn how Great Junk Removalist sorts loads for recycling and diverts waste from Melbourne landfills.',
    date: 'Aug 02, 2026',
    category: 'Eco-Friendly',
    image: '/images/hero-truck-loading.jpg?v=ai-20260919',
    imageAlt: 'Great Junk Removalist truck loading furniture for eco-friendly rubbish disposal Melbourne',
  },
  {
    id: 3,
    title: 'Top 3 Things You Should Never Put in a Melbourne Skip Bin',
    excerpt:
      'Thinking of hiring a skip for rubbish removal? These three hazardous household items can lead to fines if dumped in a standard Melbourne skip bin.',
    date: 'Jul 21, 2026',
    category: 'Tips',
    image: '/images/garage-clean-before.jpg?v=ai-20260919',
    imageAlt: 'Cluttered Melbourne garage before professional junk removal cleanout',
  },
  {
    id: 4,
    title: 'Spring Cleaning: Reclaim Your Melbourne Garage in a Weekend',
    excerpt:
      'Is your garage a storage unit? Follow this weekend guide to sorting, donating and booking residential junk removal so you can park your car inside again.',
    date: 'Jul 10, 2026',
    category: 'Residential',
    image: '/images/service-residential.webp?v=fridge-pile-20260919',
    imageAlt: 'Fridge furniture and household junk on a Melbourne driveway for residential rubbish removal',
  },
];

interface BlogProps {
  onOpenCall: () => void;
}

export const Blog: React.FC<BlogProps> = ({ onOpenCall }) => {
  const navigate = useNavigate();

  return (
    <>
      <SeoHead
        title="Junk Removal Tips & Guides Melbourne | Great Junk Removalist Blog"
        description="Expert Melbourne junk removal tips — estate clearances, eco-friendly disposal, skip bin rules and garage cleanouts from Great Junk Removalist."
      />

      <div className="bg-[#091b2f] pt-16 pb-24 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-[#84d800] font-extrabold tracking-wider uppercase text-sm mb-4 block">
            Melbourne Junk Removal Tips &amp; Guides
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            Junk Removal Blog
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Practical advice for Melbourne homeowners and businesses on decluttering, eco-friendly rubbish disposal, estate clearances and reclaiming your space.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 bg-[#84d800] text-[#091b2f] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    {post.category}
                  </div>
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center text-slate-700 text-sm mb-4 font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    {post.date}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-[#74cb00] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-800 mb-8 line-clamp-3 leading-relaxed">{post.excerpt}</p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center font-bold text-[#091b2f] text-sm group-hover:text-[#74cb00] transition-colors">
                      Read article <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <CtaBanner
        onQuoteClick={() => navigate('/quote')}
        onCallClick={onOpenCall}
      />
    </>
  );
};
