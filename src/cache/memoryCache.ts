export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; expiry: number }>();
  get(key: string): T | null { const item = this.cache.get(key); if (!item) return null; if (Date.now() > item.expiry) { this.cache.delete(key); return null; } return item.value; }
  set(key: string, value: T, ttlMs = 300000): void { this.cache.set(key, { value, expiry: Date.now() + ttlMs }); }
  delete(key: string): boolean { return this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  has(key: string): boolean { return this.get(key) !== null; }
  size(): number { return this.cache.size; }
}
export const memoryCache = new MemoryCache();
