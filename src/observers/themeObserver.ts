type Theme = 'light' | 'dark';
type ThemeCallback = (theme: Theme) => void;
class ThemeObserver {
  private subscribers: Set<ThemeCallback> = new Set();
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  constructor() { this.mediaQuery.addEventListener('change', e => this.notify(e.matches ? 'dark' : 'light')); }
  subscribe(callback: ThemeCallback) { this.subscribers.add(callback); callback(this.currentTheme); return () => this.subscribers.delete(callback); }
  notify(theme: Theme) { this.subscribers.forEach(cb => cb(theme)); }
  get currentTheme(): Theme { return this.mediaQuery.matches ? 'dark' : 'light'; }
}
export const themeObserver = new ThemeObserver();
