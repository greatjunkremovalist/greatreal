import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
}

/** Sets document title + meta description for SPA routes. */
export function SeoHead({ title, description }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [title, description]);

  return null;
}
