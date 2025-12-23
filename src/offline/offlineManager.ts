export class OfflineManager {
  private isOffline = false;
  private listeners: ((offline: boolean) => void)[] = [];
  init(): void { window.addEventListener('online', () => this.setOffline(false)); window.addEventListener('offline', () => this.setOffline(true)); this.isOffline = !navigator.onLine; }
  private setOffline(offline: boolean): void { this.isOffline = offline; this.listeners.forEach(l => l(offline)); }
  getStatus(): boolean { return this.isOffline; }
  onStatusChange(listener: (offline: boolean) => void): () => void { this.listeners.push(listener); return () => { this.listeners = this.listeners.filter(l => l !== listener); }; }
}
export const offlineManager = new OfflineManager();
