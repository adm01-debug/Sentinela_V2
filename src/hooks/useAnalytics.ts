import { useCallback } from 'react';

export function useAnalytics() {
  const track = useCallback((event: string, props?: Record<string, unknown>) => {
    console.log('Track:', event, props);
  }, []);
  const page = useCallback((name: string) => console.log('Page:', name), []);
  return { track, page };
}