export interface SyncItem { id: string; type: 'create' | 'update' | 'delete'; entity: string; data: any; timestamp: number; }
export class SyncQueue {
  private queue: SyncItem[] = [];
  add(item: Omit<SyncItem, 'id' | 'timestamp'>): string { const id = crypto.randomUUID(); this.queue.push({ ...item, id, timestamp: Date.now() }); return id; }
  getAll(): SyncItem[] { return [...this.queue]; }
  getByEntity(entity: string): SyncItem[] { return this.queue.filter(i => i.entity === entity); }
  remove(id: string): void { this.queue = this.queue.filter(i => i.id !== id); }
  clear(): void { this.queue = []; }
  size(): number { return this.queue.length; }
}
export const syncQueue = new SyncQueue();
