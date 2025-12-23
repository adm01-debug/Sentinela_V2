export function log(prefix = '[LOG]') {
  return function <T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: Parameters<T>) => {
      console.log(prefix, 'Call:', fn.name, args);
      const result = fn(...args);
      console.log(prefix, 'Result:', fn.name, result);
      return result;
    }) as T;
  };
}

export function logAsync(prefix = '[LOG]') {
  return function <T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: Parameters<T>) => {
      console.log(prefix, 'Call:', fn.name, args);
      try {
        const result = await fn(...args);
        console.log(prefix, 'Result:', fn.name, result);
        return result;
      } catch (e) {
        console.error(prefix, 'Error:', fn.name, e);
        throw e;
      }
    }) as T;
  };
}
