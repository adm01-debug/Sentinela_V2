export class OfflineStorage {
  private dbName = 'sentinela_offline';
  private db: IDBDatabase | null = null;
  async init(): Promise<void> { return new Promise((resolve, reject) => { const request = indexedDB.open(this.dbName, 1); request.onerror = () => reject(request.error); request.onsuccess = () => { this.db = request.result; resolve(); }; request.onupgradeneeded = (e) => { const db = (e.target as IDBOpenDBRequest).result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'id' }); }; }); }
  async set(key: string, value: any): Promise<void> { if (!this.db) await this.init(); return new Promise((resolve, reject) => { const tx = this.db!.transaction('data', 'readwrite'); const store = tx.objectStore('data'); store.put({ id: key, value, timestamp: Date.now() }); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); }
  async get(key: string): Promise<any> { if (!this.db) await this.init(); return new Promise((resolve, reject) => { const tx = this.db!.transaction('data', 'readonly'); const store = tx.objectStore('data'); const request = store.get(key); request.onsuccess = () => resolve(request.result?.value); request.onerror = () => reject(request.error); }); }
}
export const offlineStorage = new OfflineStorage();
