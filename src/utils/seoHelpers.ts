// Production site URL for build-time generation
const PRODUCTION_SITE_URL = 'https://kennedynespot.com';

export const getSiteUrl = (): string => {
  // For build-time (SSR/Node), use production URL
  if (typeof window === 'undefined') {
    return PRODUCTION_SITE_URL;
  }
  // For client-side, prefer current origin for flexibility
  if (window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || PRODUCTION_SITE_URL;
};

export const getProductionUrl = (): string => {
  return PRODUCTION_SITE_URL;
};

export const createCanonicalUrl = (pathname: string): string => {
  const baseUrl = getSiteUrl();
  const raw = pathname || "/";
  const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
  return `${baseUrl}${cleaned}`;
};

export const toAbsoluteUrl = (input: string | null | undefined): string | undefined => {
  if (!input) return undefined;
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  const site = getSiteUrl();
  const path = input.startsWith('/') ? input : `/${input}`;
  return `${site}${path}`;
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": toAbsoluteUrl(item.url) || item.url
    }))
  };
};
