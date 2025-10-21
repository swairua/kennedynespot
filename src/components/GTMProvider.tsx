import { ReactNode } from 'react';

interface GTMProviderProps {
  children: ReactNode;
  gtmId?: string;
}

export function GTMProvider({ children, gtmId }: GTMProviderProps) {
  // Initialize dataLayer
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
  }

  // Inject GTM script if gtmId is provided
  if (typeof window !== 'undefined' && gtmId && !document.querySelector(`script[src*="${gtmId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
  }

  return <>{children}</>;
}

// Helper function for tracking events
export const trackEvent = (event: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...parameters,
    });
  }
};

// Declare global dataLayer type
declare global {
  interface Window {
    dataLayer: any[];
  }
}