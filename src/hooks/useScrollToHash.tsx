import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Extract the hash part (everything after #)
    const hash = location.hash.slice(1);
    
    if (!hash) return;

    // Give the DOM a moment to render
    const timer = setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [location.hash]);
}
