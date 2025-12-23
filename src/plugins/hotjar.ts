declare global { interface Window { hj: (...args: any[]) => void; } }
export function initHotjar(hjid: number, hjsv: number = 6) {
  (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
    h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
    h._hjSettings = { hjid, hjsv };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script'); r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
}
export function trackHotjarEvent(eventName: string) { window.hj?.('event', eventName); }
