export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export function throttleAsync<T extends (...args: any[]) => Promise<any>>(fn: T, limit: number): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  let inThrottle = false;
  return async (...args: Parameters<T>) => {
    if (!inThrottle) {
      inThrottle = true;
      try { return await fn(...args); }
      finally { setTimeout(() => { inThrottle = false; }, limit); }
    }
    return undefined;
  };
}
