const isClient = typeof window !== "undefined";
export const localStorage = {
  get: <T>(key: string, fallback?: T): T | null => {
    if (!isClient) return fallback ?? null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : (fallback ?? null);
    } catch {
      return fallback ?? null;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (isClient) window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key): void => {
    if (isClient) window.localStorage.removeItem(key);
  },
  clear: (): void => {
    if (isClient) window.localStorage.clear();
  },
};
export const sessionStorage = {
  get: <T>(key: string, fallback?: T): T | null => {
    if (!isClient) return fallback ?? null;
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : (fallback ?? null);
    } catch {
      return fallback ?? null;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (isClient) window.sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key): void => {
    if (isClient) window.sessionStorage.removeItem(key);
  },
  clear: (): void => {
    if (isClient) window.sessionStorage.clear();
  },
};
