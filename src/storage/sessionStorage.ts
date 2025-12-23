export const sessionStore = {
  get: <T>(key: string, fallback?: T): T | null => {
    try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fallback ?? null; }
    catch { return fallback ?? null; }
  },
  set: <T>(key: string, value: T): void => sessionStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string): void => sessionStorage.removeItem(key),
  clear: (): void => sessionStorage.clear(),
  keys: (): string[] => Object.keys(sessionStorage),
};
