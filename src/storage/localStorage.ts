export const localStore = {
  get: <T>(key: string, fallback?: T): T | null => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback ?? null; }
    catch { return fallback ?? null; }
  },
  set: <T>(key: string, value: T): void => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string): void => localStorage.removeItem(key),
  clear: (): void => localStorage.clear(),
  keys: (): string[] => Object.keys(localStorage),
};
