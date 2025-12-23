export type AnalyticsProvider = 'google' | 'mixpanel' | 'segment' | 'custom';
export interface AnalyticsConfig { provider: AnalyticsProvider; trackingId?: string; }
export class AnalyticsAdapter {
  private config: AnalyticsConfig;
  constructor(config: AnalyticsConfig) { this.config = config; }
  track(event: string, properties?: Record<string, any>): void { console.log('[Analytics]', event, properties); }
  identify(userId: string, traits?: Record<string, any>): void { console.log('[Analytics] Identify', userId, traits); }
  page(name: string, properties?: Record<string, any>): void { console.log('[Analytics] Page', name, properties); }
}
export const createAnalyticsAdapter = (config: AnalyticsConfig) => new AnalyticsAdapter(config);
