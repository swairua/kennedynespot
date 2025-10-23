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

    // Create a small debug badge so we can visually verify GA status in screenshots
    const badge = document.createElement('div');
    badge.id = 'ga-debug-status';
    badge.style.position = 'fixed';
    badge.style.right = '12px';
    badge.style.bottom = '12px';
    badge.style.zIndex = '99999';
    badge.style.padding = '6px 10px';
    badge.style.borderRadius = '8px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '600';
    badge.style.color = '#fff';
    badge.style.background = 'rgba(0,0,0,0.6)';
    badge.textContent = 'GA: loading';
    document.body.appendChild(badge);

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
    script1.onload = () => {
      // mark badge as loaded and attempt a test event
      try {
        badge.textContent = 'GA: loaded';
        badge.style.background = 'rgba(16,185,129,0.95)';
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'debug_test', { debug: true });
        }
      } catch (e) {
        badge.textContent = 'GA: loaded (no gtag)';
        badge.style.background = 'rgba(239,68,68,0.95)';
      }
    };
    script1.onerror = () => {
      badge.textContent = 'GA: failed';
      badge.style.background = 'rgba(239,68,68,0.95)';
    };
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

    // Fallback timer: if gtag not available within 5s, mark as pending
    const fallback = setTimeout(() => {
      if (badge && badge.textContent === 'GA: loading') {
        badge.textContent = 'GA: pending';
        badge.style.background = 'rgba(234,179,8,0.95)';
      }
    }, 5000);

    return () => {
      // Cleanup
      clearTimeout(fallback);
      try {
        document.head.removeChild(consentScript);
        document.head.removeChild(script1);
        document.head.removeChild(script2);
      } catch (e) {
        // Scripts might already be removed
      }
      try {
        const el = document.getElementById('ga-debug-status');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      } catch (e) {}
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
