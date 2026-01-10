const cache = new Map<string, { data: any; expiry: number }>();

export const cacheGet = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
};

export const cacheSet = <T>(key: string, data: T, ttlSeconds = 300): void => {
  cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
};

export const cacheClear = (): void => cache.clear();
