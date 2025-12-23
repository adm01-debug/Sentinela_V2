export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';
export class SyncManager {
  private status: SyncStatus = 'idle';
  private lastSync: Date | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];
  getStatus(): SyncStatus { return this.status; }
  getLastSync(): Date | null { return this.lastSync; }
  setStatus(status: SyncStatus): void { this.status = status; this.listeners.forEach(l => l(status)); if (status === 'success') this.lastSync = new Date(); }
  onStatusChange(listener: (status: SyncStatus) => void): () => void { this.listeners.push(listener); return () => { this.listeners = this.listeners.filter(l => l !== listener); }; }
}
export const syncManager = new SyncManager();
