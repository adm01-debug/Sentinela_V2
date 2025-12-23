export function log(prefix = '[LOG]') {
  return function <T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: Parameters<T>) => {
      console.log(prefix, fn.name, 'called with:', args);
      const result = fn(...args);
      console.log(prefix, fn.name, 'returned:', result);
      return result;
    }) as T;
  };
}

export function logAsync(prefix = '[LOG]') {
  return function <T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: Parameters<T>) => {
      console.log(prefix, fn.name, 'called with:', args);
      const result = await fn(...args);
      console.log(prefix, fn.name, 'returned:', result);
      return result;
    }) as T;
  };
}
