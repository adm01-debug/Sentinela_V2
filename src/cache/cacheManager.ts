interface CacheEntry<T> { data: T; expiry: number; }

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) { this.cache.delete(key); return null; }
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }
  
  delete(key: string): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  has(key: string): boolean { return this.get(key) !== null; }
}

export const cacheManager = new CacheManager();
