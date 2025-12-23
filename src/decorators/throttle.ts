export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn(...args);
    }
  }) as T;
}

export function throttleAsync<T extends (...args: any[]) => Promise<any>>(fn: T, limit: number): T {
  let lastCall = 0;
  let lastResult: any;
  return (async (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = await fn(...args);
    }
    return lastResult;
  }) as T;
}
