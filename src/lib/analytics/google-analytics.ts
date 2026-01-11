declare global { interface Window { gtag: (...args: any[]) => void; dataLayer: any[]; } }

export function initGA(measurementId: string): void {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

export function trackEvent(eventName: string, params?: Record<string, any>): void {
  window.gtag?.('event', eventName, params);
}

export function trackPageView(pagePath: string): void {
  window.gtag?.('event', 'page_view', { page_path: pagePath });
}
