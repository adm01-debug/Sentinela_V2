import { ComponentType, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function withAnalytics<P extends object>(Component: ComponentType<P>) {
  return function AnalyticsComponent(props: P) {
    const location = useLocation();

    useEffect(() => {
      // Track page view
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', import.meta.env.VITE_GA_ID, { page_path: location.pathname });
      }
    }, [location]);

    return <Component {...props} />;
  };
}
