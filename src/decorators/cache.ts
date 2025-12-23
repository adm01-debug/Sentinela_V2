export function cache<T extends (...args: any[]) => any>(ttlMs = 5 * 60 * 1000): (fn: T) => T {
  return (fn: T) => {
    const cacheMap = new Map<string, { value: ReturnType<T>; expiry: number }>();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      const cached = cacheMap.get(key);
      if (cached && Date.now() < cached.expiry) return cached.value;
      const result = fn(...args);
      cacheMap.set(key, { value: result, expiry: Date.now() + ttlMs });
      return result;
    }) as T;
  };
}
