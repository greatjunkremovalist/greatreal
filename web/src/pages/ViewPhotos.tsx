import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

function decodeLinks(encoded: string | null): string[] {
  if (!encoded) return [];
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const json = atob(padded + pad);
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && /^https?:\/\//i.test(item));
  } catch {
    return [];
  }
}

/** Opens in Gmail app as a normal website page with tap-to-open photo links. */
export const ViewPhotos: React.FC = () => {
  const [params] = useSearchParams();
  const links = useMemo(() => decodeLinks(params.get('d')), [params]);
  const name = params.get('n') || 'Customer';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <SeoHead
        title="Quote photos | Great Junk Removalist"
        description="View junk removal quote photos submitted on the Great Junk Removalist website."
      />
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#091b2f]">Quote photos</h1>
        <p className="mt-1 text-slate-600 text-sm">From: {name}</p>

        {links.length === 0 ? (
          <p className="mt-8 text-slate-700">No photos found for this link.</p>
        ) : (
          <ul className="mt-8 space-y-8">
            {links.map((url, index) => (
              <li key={`${url}-${index}`} className="border-b border-slate-100 pb-8 last:border-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-lg font-bold text-[#1a73e8] underline underline-offset-2"
                >
                  Tap to open photo {index + 1}
                </a>
                <a href={url} target="_blank" rel="noreferrer" className="block mt-3">
                  <img
                    src={url}
                    alt={`Quote photo ${index + 1}`}
                    className="w-full rounded-xl border border-slate-200 object-cover"
                    loading="lazy"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link to="/" className="inline-block mt-8 text-sm font-bold text-[#559400] hover:text-[#091b2f]">
          ← Back to website
        </Link>
      </div>
    </div>
  );
};
