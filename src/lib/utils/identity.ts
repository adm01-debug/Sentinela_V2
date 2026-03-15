export function identity<T extends (...args: never[]) => unknown>(fn: T, wait = 300): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), wait); }) as T;
}
