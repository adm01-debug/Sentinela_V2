export interface StorageStrategy { get<T>(key: string): T | null; set<T>(key: string, value: T): void; remove(key: string): void; clear(): void; }
export class LocalStorageStrategy implements StorageStrategy {
  get<T>(key: string): T | null { const item = localStorage.getItem(key); return item ? JSON.parse(item) : null; }
  set<T>(key: string, value: T): void { localStorage.setItem(key, JSON.stringify(value)); }
  remove(key: string): void { localStorage.removeItem(key); }
  clear(): void { localStorage.clear(); }
}
export class SessionStorageStrategy implements StorageStrategy {
  get<T>(key: string): T | null { const item = sessionStorage.getItem(key); return item ? JSON.parse(item) : null; }
  set<T>(key: string, value: T): void { sessionStorage.setItem(key, JSON.stringify(value)); }
  remove(key: string): void { sessionStorage.removeItem(key); }
  clear(): void { sessionStorage.clear(); }
}
