export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export function createStorageAdapter(storage: Storage): StorageAdapter {
  return {
    get: <T>(key: string): T | null => {
      const item = storage.getItem(key);
      if (!item) return null;
      try { return JSON.parse(item) as T; } catch { return item as unknown as T; }
    },
    set: <T>(key: string, value: T): void => {
      storage.setItem(key, JSON.stringify(value));
    },
    remove: (key: string): void => { storage.removeItem(key); },
    clear: (): void => { storage.clear(); },
  };
}

export const localStorageAdapter = createStorageAdapter(localStorage);
export const sessionStorageAdapter = createStorageAdapter(sessionStorage);
