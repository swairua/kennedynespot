import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function AnalyticsProvider() {
  const location = useLocation();

  // Skip analytics for health endpoints
  const shouldSkipAnalytics = location.pathname === '/_health';

  // Track SPA page views on route changes
  // GA is already initialized in main.tsx via environment variable VITE_GA_MEASUREMENT_ID
  useEffect(() => {
    if (shouldSkipAnalytics) return;

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
  }, [location.pathname, shouldSkipAnalytics]);

  return null;
}
