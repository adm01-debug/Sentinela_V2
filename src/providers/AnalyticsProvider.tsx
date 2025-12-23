import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { trackPageView, trackEvent, setUserProperties } from '@/analytics';

interface AnalyticsContextType { track: (event: string, properties?: Record<string, any>) => void; identify: (userId: string, traits?: Record<string, any>) => void; }

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { trackPageView(window.location.pathname); }, []);

  const track = useCallback((event: string, properties?: Record<string, any>) => trackEvent(event, properties), []);
  const identify = useCallback((userId: string, traits?: Record<string, any>) => setUserProperties(userId, traits || {}), []);

  return <AnalyticsContext.Provider value={{ track, identify }}>{children}</AnalyticsContext.Provider>;
}

export const useAnalytics = () => { const ctx = useContext(AnalyticsContext); if (!ctx) throw new Error('useAnalytics must be within AnalyticsProvider'); return ctx; };
