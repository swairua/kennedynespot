import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettingsFixed } from '@/hooks/useSiteSettingsFixed';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function AnalyticsProvider() {
  const { settings, loading } = useSiteSettingsFixed();
  const location = useLocation();

  // Skip analytics for health endpoints
  const shouldSkipAnalytics = location.pathname === '/_health';

  useEffect(() => {
    if (loading || !settings?.ga4_id || shouldSkipAnalytics) return;

    // Initialize Google Consent Mode v2 BEFORE loading Analytics
    const consentScript = document.createElement('script');
    consentScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
        wait_for_update: 2000,
      });
    `;
    document.head.appendChild(consentScript);

    // Google Analytics 4
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga4_id}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${settings.ga4_id}', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=Strict;Secure'
      });
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup
      try {
        document.head.removeChild(consentScript);
        document.head.removeChild(script1);
        document.head.removeChild(script2);
      } catch (e) {
        // Scripts might already be removed
      }
    };
  }, [settings?.ga4_id, loading, shouldSkipAnalytics]);

  // Track SPA page views on route changes
  useEffect(() => {
    if (loading || !settings?.ga4_id || shouldSkipAnalytics) return;
    const id = settings.ga4_id;

    const track = () => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname,
        });
        if (import.meta.env.DEV) {
          console.debug('[GA4] page_view sent', { path: location.pathname });
        }
      } else if (import.meta.env.DEV) {
        console.debug('[GA4] gtag not ready yet');
      }
    };

    track();

    // Optionally, you could return nothing here as we only fire on change
  }, [location.pathname, settings?.ga4_id, loading, shouldSkipAnalytics]);

  return null;
}
