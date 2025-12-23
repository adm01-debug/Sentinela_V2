export class SessionCache<T = any> {
  private prefix = 'session_';
  get(key: string): T | null { const item = sessionStorage.getItem(this.prefix + key); if (!item) return null; return JSON.parse(item); }
  set(key: string, value: T): void { sessionStorage.setItem(this.prefix + key, JSON.stringify(value)); }
  delete(key: string): void { sessionStorage.removeItem(this.prefix + key); }
  clear(): void { Object.keys(sessionStorage).filter(k => k.startsWith(this.prefix)).forEach(k => sessionStorage.removeItem(k)); }
  has(key: string): boolean { return sessionStorage.getItem(this.prefix + key) !== null; }
}
export const sessionCache = new SessionCache();
