export const analyticsConfig = {
  gaId: import.meta.env.VITE_GA_ID || '',
  enabled: !!import.meta.env.VITE_GA_ID,
  debug: import.meta.env.DEV,
  anonymizeIp: true,
  trackPageViews: true,
};
