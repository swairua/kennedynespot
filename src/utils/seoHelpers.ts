export const getSiteUrl = () => {
  return import.meta.env.VITE_SITE_URL || 'https://kennedynespot.com';
};

export const createCanonicalUrl = (pathname: string) => {
  const baseUrl = getSiteUrl();
  const raw = pathname || "/";
  const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
  // Always use hash-based routing for canonical URLs to match production routing
  return `${baseUrl}/#${cleaned}`;
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  const site = getSiteUrl();
  const toAbsoluteHashUrl = (input: string) => {
    if (/^https?:\/\//i.test(input)) {
      try {
        const u = new URL(input);
        const siteUrl = new URL(site);
        if (u.origin === siteUrl.origin && !u.href.includes('/#/')) {
          return `${siteUrl.origin}/#${u.pathname.replace(/^\/+/, '/')}`;
        }
        return u.href;
      } catch {
        return input;
      }
    }
    const path = input.startsWith('/') ? input : `/${input}`;
    return `${site}/#${path}`;
  };

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": toAbsoluteHashUrl(item.url)
    }))
  };
};
