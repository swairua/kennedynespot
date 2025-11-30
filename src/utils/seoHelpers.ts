export const getSiteUrl = () => {
  return import.meta.env.VITE_SITE_URL || 'https://kennedynespot.com';
};

export const createCanonicalUrl = (pathname: string) => {
  const baseUrl = getSiteUrl();
  const raw = pathname || "/";
  const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
  return `${baseUrl}${cleaned}`;
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  const site = getSiteUrl();
  const toAbsoluteUrl = (input: string) => {
    if (/^https?:\/\//i.test(input)) {
      return input;
    }
    const path = input.startsWith('/') ? input : `/${input}`;
    return `${site}${path}`;
  };

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": toAbsoluteUrl(item.url)
    }))
  };
};
