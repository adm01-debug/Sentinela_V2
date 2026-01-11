import { useCallback } from 'react';
import { trackEvent, trackPageView } from './google-analytics';

export function useAnalytics() {
  const track = useCallback((event: string, params?: Record<string, any>) => {
    trackEvent(event, params);
  }, []);
  
  const pageView = useCallback((path: string) => {
    trackPageView(path);
  }, []);
  
  return { track, pageView };
}
