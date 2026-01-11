import { useCallback } from 'react';
import { trackMixpanelEvent, identifyUser } from '@/lib/analytics/mixpanel';

export function useMixpanel() {
  const track = useCallback((event: string, props?: Record<string, any>) => trackMixpanelEvent(event, props), []);
  const identify = useCallback((userId: string, traits?: Record<string, any>) => identifyUser(userId, traits), []);
  return { track, identify };
}
