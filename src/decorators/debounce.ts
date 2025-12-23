export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(fn: T, delay: number): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => new Promise((resolve) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => resolve(fn(...args)), delay);
  });
}
