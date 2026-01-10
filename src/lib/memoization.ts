const memoCache = new Map<string, any>();

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T => {
  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (memoCache.has(key)) return memoCache.get(key);
    const result = fn(...args);
    memoCache.set(key, result);
    return result;
  }) as T;
};

export const clearMemoCache = (): void => memoCache.clear();
