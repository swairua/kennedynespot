export const getSiteUrl = () => {
  return import.meta.env.VITE_SITE_URL || 'https://institutional-trader.com';
};

export const createCanonicalUrl = (pathname: string) => {
  const baseUrl = getSiteUrl();
  return `${baseUrl}${pathname}`;
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};