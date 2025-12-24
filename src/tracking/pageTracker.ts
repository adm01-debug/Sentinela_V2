export interface PageView { id: string; path: string; title: string; referrer: string; timestamp: Date; duration?: number; }
export class PageTracker {
  private views: PageView[] = [];
  private currentView: PageView | null = null;
  trackPageView(path: string, title: string): PageView { if (this.currentView) { this.currentView.duration = Date.now() - this.currentView.timestamp.getTime(); } const view: PageView = { id: crypto.randomUUID(), path, title, referrer: document.referrer, timestamp: new Date() }; this.views.push(view); this.currentView = view; return view; }
  getViews(): PageView[] { return [...this.views]; }
  getAverageDuration(): number { const withDuration = this.views.filter(v => v.duration); return withDuration.reduce((sum, v) => sum + (v.duration || 0), 0) / withDuration.length; }
}
export const pageTracker = new PageTracker();
