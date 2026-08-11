export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); };
};
export const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, limit: number) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
};
export const isEmpty = (val): boolean => val === null || val === undefined || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0) || (typeof val === 'object' && Object.keys(val as object).length === 0);
export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
export const randomId = () => Math.random().toString(36).substring(2, 11);
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
