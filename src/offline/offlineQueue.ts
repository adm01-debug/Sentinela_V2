export interface QueuedAction { id: string; type: string; payload: any; timestamp: number; retries: number; }
export class OfflineQueue {
  private queue: QueuedAction[] = [];
  private storageKey = 'offline_queue';
  load(): void { const stored = localStorage.getItem(this.storageKey); if (stored) this.queue = JSON.parse(stored); }
  save(): void { localStorage.setItem(this.storageKey, JSON.stringify(this.queue)); }
  add(type: string, payload: any): string { const id = crypto.randomUUID(); this.queue.push({ id, type, payload, timestamp: Date.now(), retries: 0 }); this.save(); return id; }
  getAll(): QueuedAction[] { return [...this.queue]; }
  remove(id: string): void { this.queue = this.queue.filter(a => a.id !== id); this.save(); }
  clear(): void { this.queue = []; this.save(); }
  incrementRetry(id: string): void { const action = this.queue.find(a => a.id === id); if (action) action.retries++; this.save(); }
}
export const offlineQueue = new OfflineQueue();
