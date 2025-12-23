interface SyncItem { id: string; action: 'create' | 'update' | 'delete'; entity: string; data: any; timestamp: number; }
class SyncQueue {
  private queue: SyncItem[] = [];
  private storageKey = 'sync_queue';
  constructor() { this.load(); }
  private load() { const stored = localStorage.getItem(this.storageKey); if (stored) this.queue = JSON.parse(stored); }
  private save() { localStorage.setItem(this.storageKey, JSON.stringify(this.queue)); }
  add(action: SyncItem['action'], entity: string, data: any) { this.queue.push({ id: Date.now().toString(36), action, entity, data, timestamp: Date.now() }); this.save(); }
  async sync(handler: (item: SyncItem) => Promise<void>) { while (this.queue.length) { const item = this.queue[0]; await handler(item); this.queue.shift(); this.save(); } }
  get pending() { return this.queue.length; }
  clear() { this.queue = []; this.save(); }
}
export const syncQueue = new SyncQueue();
