import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.greatjunkremovalist.com.au';

interface SeoHeadProps {
  title: string;
  description: string;
}

/** Sets document title, meta description, and a canonical URL that matches this page. */
export function SeoHead({ title, description }: SeoHeadProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    const canonicalHref = pathname === '/' ? `${SITE}/` : `${SITE}${pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);
  }, [title, description, pathname]);

  return null;
}
