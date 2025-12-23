import { createStorageAdapter } from '@/adapters/storageAdapter';

export const storage = createStorageAdapter(localStorage);

export const getItem = <T>(key: string): T | null => storage.get<T>(key);
export const setItem = <T>(key: string, value: T): void => storage.set(key, value);
export const removeItem = (key: string): void => storage.remove(key);
export const clear = (): void => storage.clear();
