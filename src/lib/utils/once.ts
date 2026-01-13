export function once<T extends (...args: any[]) => any>(fn: T, wait = 300): T {
  let timeout: NodeJS.Timeout;
  return ((...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), wait); }) as T;
}
