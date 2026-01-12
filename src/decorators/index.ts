export { Log, LogAsync } from "./log";
export { Cache, ClearCache } from "./cache";

export function Retry(attempts = 3, delay = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      for (let i = 0; i < attempts; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (i < attempts - 1) {
            await new Promise((r) => setTimeout(r, delay * Math.pow(2, i)));
          }
        }
      }
      throw lastError!;
    };

    return descriptor;
  };
}

export function Throttle(limit: number) {
  let lastRun = 0;
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      if (now - lastRun >= limit) {
        lastRun = now;
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}
