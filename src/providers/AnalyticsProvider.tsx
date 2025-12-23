import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsContextType { trackEvent: (name: string, props?: Record<string, any>) => void; }

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if ((window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GA_ID, { page_path: location.pathname });
    }
  }, [location]);

  const trackEvent = (name: string, props?: Record<string, any>) => {
    if ((window as any).gtag) (window as any).gtag('event', name, props);
  };

  return <AnalyticsContext.Provider value={{ trackEvent }}>{children}</AnalyticsContext.Provider>;
}

export const useAnalytics = () => { const ctx = useContext(AnalyticsContext); if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider'); return ctx; };
