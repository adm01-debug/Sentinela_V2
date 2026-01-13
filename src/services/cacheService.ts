const cache = new Map<string, { data: any; expiry: number }>();
export const cacheService = {
  set: (key: string, data: any, ttl = 300000) => { cache.set(key, { data, expiry: Date.now() + ttl }); },
  get: <T>(key: string): T | null => { const item = cache.get(key); if (!item || item.expiry < Date.now()) { cache.delete(key); return null; } return item.data; },
  clear: () => cache.clear(),
  delete: (key: string) => cache.delete(key),
};
