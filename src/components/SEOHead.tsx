import { Helmet } from 'react-helmet-async';
import { useSiteSettingsFixed } from '@/hooks/useSiteSettingsFixed';

interface LcpPreload {
  href: string;
  media?: string;
  imagesrcset?: string;
  sizes?: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  twitterImage?: string;
  schema?: object;
  lcpImage?: string; // optional LCP image to preload
  lcpPreloads?: LcpPreload[];
}

export function SEOHead({
  title = "KenneDyne spot | Structured Trading Education",
  description = "Learn institutional trading concepts with structured education, mentorship, and the D.R.I.V.E Framework. Access insights and community resources including strategy videos and checklists.",
  keywords = "institutional trading education, forex mentorship, trading psychology, DRIVE framework, risk management, forex education Kenya, trading course",
  canonical,
  ogImage = "https://cdn.builder.io/api/v1/image/assets%2F929a94a73a3e4246bd07aab61b8a8dc4%2Fb6f2d0b05dfa477f876d3dbd034ca567?format=webp&width=1200",
  ogImageWidth = 1200,
  ogImageHeight = 630,
  twitterImage,
  schema,
  lcpImage,
  lcpPreloads
}: SEOHeadProps) {
  // Use site settings for defaults if available
  const { settings } = useSiteSettingsFixed();

  const finalDescription = description || settings?.seo_default_description || "Learn institutional trading concepts with structured education, mentorship, and the D.R.I.V.E Framework.";
  const finalOgImage = ogImage || settings?.seo_default_og_image || "https://cdn.builder.io/api/v1/image/assets%2F9af9c1aa4ad745918123514a4c9dbcd1%2Ffcabe7003acd4e008a04b6c739f05076?format=webp&width=1200";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="author" content="KenneDyne spot" />
      <meta name="publisher" content="KenneDyne spot" />
      <meta name="theme-color" content="#8b5cf6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="KenneDyne spot" />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content={ogImageWidth?.toString()} />
      <meta property="og:image:height" content={ogImageHeight?.toString()} />
      <meta property="og:image:type" content="image/webp" />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={twitterImage || finalOgImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Alternate Language Links (if applicable) */}
      <link rel="alternate" href={canonical} hrefLang="en" />

      {/* Image Preloading */}
      {lcpImage && <link rel="preload" as="image" href={lcpImage} />}
      {lcpPreloads && lcpPreloads.map((p, i) => (
        <link
          key={i}
          rel="preload"
          as="image"
          href={p.href}
          {...(p.media ? { media: p.media } : {})}
          {...(p.imagesrcset ? { imagesrcset: p.imagesrcset } : {})}
          {...(p.sizes ? { sizes: p.sizes } : {})}
        />
      ))}

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Organization Schema (Global) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "KenneDyne spot",
          "url": "https://kennedynespot.com",
          "logo": "https://cdn.builder.io/api/v1/image/assets%2F929a94a73a3e4246bd07aab61b8a8dc4%2Ffcabe7003acd4e008a04b6c739f05076?format=webp&width=200",
          "description": "Professional forex trading education with the D.R.I.V.E Framework",
          "sameAs": [
            "https://www.facebook.com/kennedynespot",
            "https://twitter.com/kennedynespot",
            "https://linkedin.com/company/kennedynespot",
            "https://instagram.com/kennedynespot"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "url": "https://kennedynespot.com/contact"
          }
        })}
      </script>
    </Helmet>
  );
}
