interface CacheEntry<T> { data: T; expiresAt: number; }

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.cache.delete(key); return null; }
    return entry.data as T;
  }

  has(key: string): boolean { return this.get(key) !== null; }
  delete(key: string): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  size(): number { return this.cache.size; }
}

export const cacheManager = new CacheManager();
