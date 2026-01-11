interface CacheEntry<T> { data: T; expiry: number; }
class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000;
  set<T>(key: string, data: T, ttl = this.defaultTTL): void { this.cache.set(key, { data, expiry: Date.now() + ttl }); }
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) { this.cache.delete(key); return null; }
    return entry.data as T;
  }
  has(key: string): boolean { return this.get(key) !== null; }
  delete(key: string): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  invalidatePattern(pattern: RegExp): void { for (const key of this.cache.keys()) { if (pattern.test(key)) this.cache.delete(key); } }
}
export const cacheManager = new CacheManager();
