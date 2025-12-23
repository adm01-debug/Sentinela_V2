export class IndexedDBCache {
  private dbName = 'app_cache';
  private db: IDBDatabase | null = null;
  async init(): Promise<void> { return new Promise((resolve, reject) => { const request = indexedDB.open(this.dbName, 1); request.onerror = () => reject(request.error); request.onsuccess = () => { this.db = request.result; resolve(); }; request.onupgradeneeded = (e) => { const db = (e.target as IDBOpenDBRequest).result; if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache', { keyPath: 'key' }); }; }); }
  async get<T>(key: string): Promise<T | null> { if (!this.db) await this.init(); return new Promise((resolve, reject) => { const tx = this.db!.transaction('cache', 'readonly'); const request = tx.objectStore('cache').get(key); request.onsuccess = () => resolve(request.result?.value ?? null); request.onerror = () => reject(request.error); }); }
  async set(key: string, value: any): Promise<void> { if (!this.db) await this.init(); return new Promise((resolve, reject) => { const tx = this.db!.transaction('cache', 'readwrite'); tx.objectStore('cache').put({ key, value }); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); }
}
export const indexedDBCache = new IndexedDBCache();
