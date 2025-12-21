import { useState, useCallback, useEffect } from 'react';
export function useIndexedDB<T>(dbName: string, storeName: string) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  useEffect(() => { const req = indexedDB.open(dbName, 1); req.onsuccess = () => setDb(req.result); }, [dbName]);
  const get = useCallback(async (key: string): Promise<T | undefined> => { if (!db) return; return new Promise((res) => { const tx = db.transaction(storeName, 'readonly'); tx.objectStore(storeName).get(key).onsuccess = (e) => res((e.target as IDBRequest).result); }); }, [db, storeName]);
  return { db, get };
}