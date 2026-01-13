// Caching utilities
const CACHE_PREFIX = 'sentinela_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> { data: T; expires: number; }

export const cache = {
  set: <T>(key: string, data: T, ttl = DEFAULT_TTL) => {
    const item: CacheItem<T> = { data, expires: Date.now() + ttl };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  },
  get: <T>(key: string): T | null => {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const item: CacheItem<T> = JSON.parse(raw);
    if (Date.now() > item.expires) { localStorage.removeItem(CACHE_PREFIX + key); return null; }
    return item.data;
  },
  remove: (key: string) => localStorage.removeItem(CACHE_PREFIX + key),
  clear: () => { Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k)); }
};

export const apiCache = {
  fetch: async <T>(url: string, options?: RequestInit, ttl?: number): Promise<T> => {
    const cacheKey = `api_${url}`;
    const cached = cache.get<T>(cacheKey);
    if (cached) return cached;
    const response = await fetch(url, options);
    const data = await response.json();
    cache.set(cacheKey, data, ttl);
    return data;
  }
};
