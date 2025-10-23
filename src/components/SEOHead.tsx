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
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="KenneDyne spot" />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content={ogImageWidth?.toString()} />
      <meta property="og:image:height" content={ogImageHeight?.toString()} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={twitterImage || finalOgImage} />
      {canonical && <link rel="canonical" href={canonical} />}
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
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
