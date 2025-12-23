export class CacheInfra {
  private cache = new Map<string, { value: any; expiry: number }>();
  get<T>(key: string): T | null { const item = this.cache.get(key); if (!item) return null; if (Date.now() > item.expiry) { this.cache.delete(key); return null; } return item.value; }
  set<T>(key: string, value: T, ttlMs = 300000): void { this.cache.set(key, { value, expiry: Date.now() + ttlMs }); }
  delete(key: string): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  has(key: string): boolean { return this.get(key) !== null; }
}
export const cacheInfra = new CacheInfra();
