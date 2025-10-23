import { SEOHead } from './SEOHead';
import { driveFullName } from '@/content/drive';

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KenneDyne spot",
    "url": typeof window !== 'undefined' ? window.location.origin : "",
    "logo": "https://cdn.builder.io/api/v1/image/assets%2F9af9c1aa4ad745918123514a4c9dbcd1%2Ffcabe7003acd4e008a04b6c739f05076?format=webp&width=1200",
    "description": `Structured trading education, mentorship, and the ${driveFullName} Framework for institutional trading concepts`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+254 101 316 169",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://t.me/KenneDynespot",
      "https://whatsapp.com/channel/0029Va5oaai3WHTR1PyrOI1n",
      "https://www.instagram.com/kennedyne_spot?igsh=NnVoeXJoZ2dmemF5",
      "https://x.com/InstitutionalKE",
      "https://www.youtube.com/@InstitutionalTraderKE"
    ]
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${driveFullName} Trading Framework`,
    "description": `Learn institutional trading concepts with the ${driveFullName} methodology - structured education and mentorship`,
    "provider": {
      "@type": "Organization",
      "name": "KenneDyne spot"
    },
    "educationalLevel": "Intermediate to Advanced",
    "teaches": ["Forex Trading", "DRIVE Strategy", "Risk Management", "Trading Psychology", "Market Analysis"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the D.R.I.V.E Framework?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `D.R.I.V.E is our systematic trading framework: ${driveFullName}. It teaches traders to analyze market direction through multiple timeframes, define trading ranges, identify high-probability interest points, apply proper risk management, and execute trades with institutional precision.`
        }
      },
      {
        "@type": "Question",
        "name": "Is trading education suitable for beginners?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our structured education program accommodates various skill levels, with mentorship support for personalized learning."
        }
      }
    ]
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KenneDyne spot",
    "url": typeof window !== 'undefined' ? window.location.origin : "",
    "potentialAction": {
      "@type": "SearchAction",
      "target": (typeof window !== 'undefined' ? window.location.origin : "") + "/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, courseSchema, faqSchema, webSiteSchema]
  };

  return (
    <SEOHead 
      schema={combinedSchema}
    />
  );
}
