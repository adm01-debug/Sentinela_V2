export class LocalStorageCache<T = any> {
  private prefix = 'cache_';
  get(key: string): T | null { const item = localStorage.getItem(this.prefix + key); if (!item) return null; const parsed = JSON.parse(item); if (Date.now() > parsed.expiry) { this.delete(key); return null; } return parsed.value; }
  set(key: string, value: T, ttlMs = 3600000): void { localStorage.setItem(this.prefix + key, JSON.stringify({ value, expiry: Date.now() + ttlMs })); }
  delete(key: string): void { localStorage.removeItem(this.prefix + key); }
  clear(): void { Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => localStorage.removeItem(k)); }
  has(key: string): boolean { return this.get(key) !== null; }
}
export const localStorageCache = new LocalStorageCache();
