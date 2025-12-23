const DB_NAME = 'sentinela';
const DB_VERSION = 1;

export const openDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onerror = () => reject(req.error);
  req.onsuccess = () => resolve(req.result);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache', { keyPath: 'key' });
    if (!db.objectStoreNames.contains('offline')) db.createObjectStore('offline', { keyPath: 'id', autoIncrement: true });
  };
});

export const idbGet = async <T>(store: string, key: string): Promise<T | null> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => resolve(null);
  });
};

export const idbSet = async <T>(store: string, key: string, value: T): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put({ key, value });
    tx.oncomplete = () => resolve();
  });
};
