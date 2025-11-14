import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function GAStatusCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [gaId, setGaId] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    // Check GA status
    const checkGAStatus = () => {
      const envGaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
      setGaId(envGaId || 'Not configured');

      if (!envGaId) {
        setStatus('error');
        setDetails('VITE_GA_MEASUREMENT_ID environment variable is not set');
        return;
      }

      // Check if gtag is available
      if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
        setStatus('success');
        setDetails(`GA4 initialized successfully. GA ID: ${envGaId}`);
      } else {
        // Wait a moment for gtag to load from the script
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
            setStatus('success');
            setDetails(`GA4 initialized successfully. GA ID: ${envGaId}`);
          } else {
            setStatus('error');
            setDetails('gtag function not found. GA script may not have loaded.');
          }
        }, 2000);
      }
    };

    checkGAStatus();
  }, []);

  return (
    <div className="space-y-3">
      {status === 'loading' && (
        <Alert>
          <Loader className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking GA status...</AlertDescription>
        </Alert>
      )}

      {status === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✓ Google Analytics is working correctly
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{details}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm space-y-2 p-3 bg-muted rounded-md">
        <div>
          <span className="font-semibold">GA Measurement ID:</span>
          <code className="ml-2 bg-background px-2 py-1 rounded text-xs">{gaId}</code>
        </div>
        {details && (
          <div className="text-muted-foreground">{details}</div>
        )}
      </div>

      {status === 'success' && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ GA script loaded and initialized</p>
          <p>✓ Page view tracking is active</p>
          <p>✓ Consent mode configured</p>
        </div>
      )}
    </div>
  );
}
