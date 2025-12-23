type ActivityCallback = (isActive: boolean) => void;
class ActivityObserver {
  private subscribers: Set<ActivityCallback> = new Set();
  private timeout: NodeJS.Timeout | null = null;
  private isActive = true;
  constructor() { ['mousemove', 'keydown', 'scroll', 'click'].forEach(e => document.addEventListener(e, () => this.reset())); }
  subscribe(callback: ActivityCallback, idleTimeout = 300000) { this.subscribers.add(callback); this.startTimer(idleTimeout); return () => this.subscribers.delete(callback); }
  private reset() { if (!this.isActive) { this.isActive = true; this.notify(); } }
  private startTimer(timeout: number) { if (this.timeout) clearTimeout(this.timeout); this.timeout = setTimeout(() => { this.isActive = false; this.notify(); }, timeout); }
  notify() { this.subscribers.forEach(cb => cb(this.isActive)); }
}
export const activityObserver = new ActivityObserver();
