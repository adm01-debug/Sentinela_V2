import { createStorageAdapter } from '@/adapters/storageAdapter';

export const sessionStore = createStorageAdapter(sessionStorage);

export const getSessionItem = <T>(key: string): T | null => sessionStore.get<T>(key);
export const setSessionItem = <T>(key: string, value: T): void => sessionStore.set(key, value);
export const removeSessionItem = (key: string): void => sessionStore.remove(key);
export const clearSession = (): void => sessionStore.clear();
