type NetworkCallback = (isOnline: boolean) => void;
class NetworkObserver {
  private subscribers: Set<NetworkCallback> = new Set();
  constructor() { window.addEventListener('online', () => this.notify(true)); window.addEventListener('offline', () => this.notify(false)); }
  subscribe(callback: NetworkCallback) { this.subscribers.add(callback); callback(navigator.onLine); return () => this.subscribers.delete(callback); }
  notify(isOnline: boolean) { this.subscribers.forEach(cb => cb(isOnline)); }
  get isOnline() { return navigator.onLine; }
}
export const networkObserver = new NetworkObserver();
