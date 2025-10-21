import { Helmet } from 'react-helmet-async';
import Learn from './Learn';
import { StructuredData } from '@/components/StructuredData';
import { createBreadcrumbSchema } from '@/utils/seoHelpers';

export default function LearnWithSEO() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://institutional-trader.com/' },
    { name: 'Services', url: 'https://institutional-trader.com/services' },
    { name: 'Learn', url: 'https://institutional-trader.com/services/learn' }
  ]);

  return (
    <>
      <Helmet>
        <title>Learn Forex Trading - Professional Education | KenneDyne spot</title>
        <meta 
          name="description" 
          content="Master forex trading with our structured learning paths. From beginner foundations to advanced institutional strategies. Learn the DRIVE methodology and trade like a professional." 
        />
        <meta 
          name="keywords" 
          content="forex education, trading courses, DRIVE methodology, forex learning, institutional trading, professional trading education, Kenya forex training" 
        />
        <link rel="canonical" href="https://institutional-trader.com/services/learn" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Learn Forex Trading - Professional Education | KenneDyne spot" />
        <meta property="og:description" content="Master forex trading with our structured learning paths. From beginner foundations to advanced institutional strategies." />
        <meta property="og:url" content="https://institutional-trader.com/services/learn" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://institutional-trader.com/og/og-default.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Learn Forex Trading - Professional Education" />
        <meta name="twitter:description" content="Master forex trading with our structured learning paths. From beginner foundations to advanced institutional strategies." />
        <meta name="twitter:image" content="https://institutional-trader.com/og/og-default.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <Learn />
    </>
  );
}
