// Sleep/Delay utilities for Sentinela v17

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delay<T>(ms: number, value?: T): Promise<T | undefined> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message || `Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<any> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          pendingPromise = fn(...args);
          const result = await pendingPromise;
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
        }
      }, ms);
    });
  };
}

export function wait(condition: () => boolean, interval: number = 100, maxWait: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime >= maxWait) {
        reject(new Error('Wait timeout'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

export function waitFor<T>(
  fn: () => T | undefined | null,
  interval: number = 100,
  maxWait: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const result = fn();
      if (result !== undefined && result !== null) {
        resolve(result);
      } else if (Date.now() - startTime >= maxWait) {
        reject(new Error('WaitFor timeout'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

export function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() => resolve());
    } else {
      Promise.resolve().then(() => resolve());
    }
  });
}

export function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function idle(options?: IdleRequestOptions): Promise<IdleDeadline> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(resolve, options);
    } else {
      setTimeout(() => resolve({ didTimeout: false, timeRemaining: () => 50 }), 1);
    }
  });
}

export class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
