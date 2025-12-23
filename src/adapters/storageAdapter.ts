export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export const localStorageAdapter: StorageAdapter = {
  get: <T>(key: string) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; },
  set: <T>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

export const sessionStorageAdapter: StorageAdapter = {
  get: <T>(key: string) => { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; },
  set: <T>(key: string, value: T) => sessionStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => sessionStorage.removeItem(key),
  clear: () => sessionStorage.clear(),
};
