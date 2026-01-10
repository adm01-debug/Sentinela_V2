const DB_NAME = 'sentinela-offline';
const STORE_NAME = 'data';

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  });
};
