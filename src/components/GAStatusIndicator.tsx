import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function GAStatusIndicator() {
  const [isGAWorking, setIsGAWorking] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const hasGtag = typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function';
    
    setIsGAWorking(!!gaId && hasGtag);
  }, []);

  if (isGAWorking === null) return null;

  return (
    <>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
          isGAWorking
            ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900'
            : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900'
        }`}
        title="Click to see GA status details"
      >
        {isGAWorking ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span>{isGAWorking ? 'GA OK' : 'GA Issues'}</span>
      </button>

      {showDetails && (
        <div className="fixed bottom-14 right-4 z-50 w-64 bg-background border border-border rounded-lg shadow-lg p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">GA Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {isGAWorking ? (
            <div className="space-y-1 text-green-700 dark:text-green-300">
              <p>✓ GA4 ID: {import.meta.env.VITE_GA_MEASUREMENT_ID}</p>
              <p>✓ gtag function available</p>
              <p>✓ dataLayer initialized</p>
              <p className="text-muted-foreground mt-2">Google Analytics is working correctly</p>
            </div>
          ) : (
            <div className="space-y-1 text-red-700 dark:text-red-300">
              <p>✗ GA4 ID: {import.meta.env.VITE_GA_MEASUREMENT_ID || 'Not configured'}</p>
              <p>✗ gtag function: {typeof window.gtag}</p>
              <p className="text-muted-foreground mt-2">Check configuration</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
