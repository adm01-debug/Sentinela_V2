export function trackPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', import.meta.env.VITE_GA_ID, { page_path: path, page_title: title });
  }
  if (import.meta.env.DEV) console.log('[PageView]', path, title);
}
