export const AnalyticsEvents = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
  FORM_SUBMIT: 'form_submit',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  ERROR: 'error',
  FEATURE_USE: 'feature_use',
};

export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, properties);
  }
  console.log('[Analytics]', name, properties);
}
