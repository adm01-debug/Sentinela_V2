/**
 * @fileoverview CDN Cache
 * @module @sentinela/core/cdn
 */
export interface CacheEntry { key: string; value: unknown; ttl: number; createdAt: number; }
export class CDNCache {
  private cache = new Map<string, CacheEntry>();
  set(key: string, value: unknown, ttl: number): void {
    this.cache.set(key, { key, value, ttl, createdAt: Date.now() });
  }
  get(key: string): unknown | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.createdAt > entry.ttl) { this.cache.delete(key); return undefined; }
    return entry.value;
  }
  invalidate(key: string): void { this.cache.delete(key); }
  purge(): void { this.cache.clear(); }
}
