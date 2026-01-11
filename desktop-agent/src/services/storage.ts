import Store from 'electron-store';

const store = new Store();

export function setItem<T>(key: string, value: T): void {
  store.set(key, value);
}

export function getItem<T>(key: string): T | undefined {
  return store.get(key) as T;
}

export function removeItem(key: string): void {
  store.delete(key);
}
