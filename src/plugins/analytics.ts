declare global { interface Window { gtag: (...args: any[]) => void; } }
export function initAnalytics(measurementId: string) {
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  script.async = true;
  document.head.appendChild(script);
  window.gtag = function() { (window as any).dataLayer = (window as any).dataLayer || []; (window as any).dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}
export function trackEvent(action: string, category: string, label?: string, value?: number) { window.gtag?.('event', action, { event_category: category, event_label: label, value }); }
