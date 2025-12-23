export function cache<T extends (...args: any[]) => any>(ttlMs = 60000): (fn: T) => T {
  return (fn: T): T => {
    const store = new Map<string, { value: ReturnType<T>; expiresAt: number }>();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      const cached = store.get(key);
      if (cached && Date.now() < cached.expiresAt) return cached.value;
      const result = fn(...args);
      store.set(key, { value: result, expiresAt: Date.now() + ttlMs });
      return result;
    }) as T;
  };
}
