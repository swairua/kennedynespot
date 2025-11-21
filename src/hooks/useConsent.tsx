import { useState, useEffect } from 'react';

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
}

const CONSENT_KEY = 'user-consent';

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConsent(parsed);
        updateGoogleConsent(parsed);
      } catch (error) {
        console.error('Failed to parse consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: ConsentState) => {
    setConsent(newConsent);
    setShowBanner(false);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    updateGoogleConsent(newConsent);
  };

  const acceptAll = () => {
    const allConsent: ConsentState = {
      analytics: true,
      marketing: true,
      functional: true,
      necessary: true,
    };
    saveConsent(allConsent);
  };

  const rejectAll = () => {
    const minimalConsent: ConsentState = {
      analytics: false,
      marketing: false,
      functional: false,
      necessary: true,
    };
    saveConsent(minimalConsent);
  };

  return {
    consent,
    showBanner,
    saveConsent,
    acceptAll,
    rejectAll,
    hideBanner: () => setShowBanner(false),
  };
}

// Update Google Consent Mode v2
function updateGoogleConsent(consent: ConsentState) {
  if (typeof window === 'undefined') return;

  const payload = {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.marketing ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  try {
    // Prefer using gtag if available
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', payload);
    } else {
      // Fallback: push the consent update to dataLayer so GTM/gtag can pick it up when it loads
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['consent', 'update', payload]);
    }

    // Also push a helpful flag for debugging/network inspection
    window.dataLayer.push({ event: 'consent_update_applied', ...payload });
  } catch (e) {
    console.error('Failed to update Google consent:', e);
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
