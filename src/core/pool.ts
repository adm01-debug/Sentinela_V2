/**
 * @fileoverview Generic Object Pool
 * @module @sentinela/core/pool
 */
export interface PoolConfig<T> { create: () => Promise<T>; destroy?: (item: T) => Promise<void>; minSize?: number; maxSize?: number; }
export class Pool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  constructor(private config: PoolConfig<T>) {}
  async acquire(): Promise<T> {
    if (this.available.length > 0) { const item = this.available.pop()!; this.inUse.add(item); return item; }
    if (this.inUse.size < (this.config.maxSize ?? 10)) { const item = await this.config.create(); this.inUse.add(item); return item; }
    throw new Error('Pool exhausted');
  }
  async release(item: T): Promise<void> { this.inUse.delete(item); this.available.push(item); }
  async drain(): Promise<void> {
    for (const item of [...this.available, ...this.inUse]) { if (this.config.destroy) await this.config.destroy(item); }
    this.available = []; this.inUse.clear();
  }
}
