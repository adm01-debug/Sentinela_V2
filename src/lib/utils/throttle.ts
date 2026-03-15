export function throttle<T extends (...args: never[]) => unknown>(fn: T, wait = 300): T {
  let timeout: ReturnType<typeof setTimeout>;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  }) as T;
}
