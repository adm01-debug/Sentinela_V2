import { useCallback, useRef } from 'react';

interface AnalyticsEvent { name: string; properties?: Record<string, any>; timestamp?: Date; }
type AnalyticsProvider = 'ga4' | 'mixpanel' | 'amplitude' | 'custom';

export function useAnalytics(provider: AnalyticsProvider = 'custom') {
  const queue = useRef<AnalyticsEvent[]>([]);

  const track = useCallback((name: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = { name, properties, timestamp: new Date() };
    queue.current.push(event);
    
    switch (provider) {
      case 'ga4': if (typeof gtag !== 'undefined') gtag('event', name, properties); break;
      case 'mixpanel': if (typeof mixpanel !== 'undefined') (mixpanel as any).track(name, properties); break;
      case 'amplitude': if (typeof amplitude !== 'undefined') (amplitude as any).track(name, properties); break;
      default: console.debug('[Analytics]', name, properties);
    }
  }, [provider]);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    switch (provider) {
      case 'ga4': if (typeof gtag !== 'undefined') gtag('set', { user_id: userId, ...traits }); break;
      case 'mixpanel': if (typeof mixpanel !== 'undefined') { (mixpanel as any).identify(userId); if (traits) (mixpanel as any).people.set(traits); } break;
      case 'amplitude': if (typeof amplitude !== 'undefined') { (amplitude as any).setUserId(userId); if (traits) (amplitude as any).setUserProperties(traits); } break;
    }
  }, [provider]);

  const page = useCallback((name: string, properties?: Record<string, any>) => track('page_view', { page_name: name, ...properties }), [track]);
  const getEvents = useCallback(() => [...queue.current], []);

  return { track, identify, page, getEvents };
}
export default useAnalytics;
