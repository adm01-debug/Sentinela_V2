export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (inThrottle) { lastArgs = args; return; }
    fn.apply(this, args);
    inThrottle = true;
    setTimeout(() => { inThrottle = false; if (lastArgs) { fn.apply(this, lastArgs); lastArgs = null; } }, limit);
  };
}
