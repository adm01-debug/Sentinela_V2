import { memoryCache } from './memoryCache';
import { localStorageCache } from './localStorageCache';
export class HybridCache<T = any> {
  get(key: string): T | null { let value = memoryCache.get(key); if (value !== null) return value; value = localStorageCache.get(key); if (value !== null) { memoryCache.set(key, value); return value; } return null; }
  set(key: string, value: T, ttlMs = 300000): void { memoryCache.set(key, value, ttlMs); localStorageCache.set(key, value, ttlMs); }
  delete(key: string): void { memoryCache.delete(key); localStorageCache.delete(key); }
  clear(): void { memoryCache.clear(); localStorageCache.clear(); }
}
export const hybridCache = new HybridCache();
