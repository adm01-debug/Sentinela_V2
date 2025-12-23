export interface CacheStrategy { get<T>(key: string): T | null; set<T>(key: string, value: T, ttl?: number): void; has(key: string): boolean; delete(key: string): void; }
export class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  get<T>(key: string): T | null { const entry = this.cache.get(key); if (!entry) return null; if (Date.now() > entry.expiresAt) { this.cache.delete(key); return null; } return entry.value; }
  set<T>(key: string, value: T, ttl = 300000): void { this.cache.set(key, { value, expiresAt: Date.now() + ttl }); }
  has(key: string): boolean { return this.get(key) !== null; }
  delete(key: string): void { this.cache.delete(key); }
}
