// Centralized links configuration for all CTAs
export const LINKS = {
  // Telegram links
  telegram: {
    channel: "https://t.me/institutionaltrader_ke",
    community: "https://t.me/institutionaltrader_ke",
    support: "https://t.me/institutionaltrader_ke",
    kenneDynespot: "https://t.me/KenneDynespot",
  },
  
  // Exness links (affiliate)
  exness: {
    signup: "https://one.exnesstrack.org/a/17eqnrbs54",
    demo: "https://one.exnesstrack.org/a/17eqnrbs54",
    account: "https://one.exnesstrack.org/a/17eqnrbs54",
  },

  // WhatsApp (use whatsapp.ts utility for dynamic links)
  whatsapp: {
    contact: "https://wa.me/254726529166",
    support: "https://wa.me/254726529166?text=Hi%21%20I%20am%20interested%20in%20learning%20more%20about%20your%20trading%20education%20programs.",
    channel: "https://whatsapp.com/channel/0029Va5oaai3WHTR1PyrOI1n"
  },
  instagram: "https://www.instagram.com/kennedyne_spot?igsh=NnVoeXJoZ2dmemF5",
  
  // Internal links
  internal: {
    strategy: "/strategy",
    learn: "/services/learn",
    mentorship: "/mentorship",
    blog: "/blog",
    contact: "/contact",
    resources: "/resources",
  }
} as const;

// Helper function to get external link props
export const getExternalLinkProps = (url: string) => ({
  href: url,
  target: "_blank",
  rel: "noopener noreferrer sponsored"
});

// Helper function to get internal link props
export const getInternalLinkProps = (url: string) => ({
  href: url
});
