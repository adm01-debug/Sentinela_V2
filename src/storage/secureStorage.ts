const ENCRYPTION_KEY = 'sentinela-secure-key';

function encrypt(data: string): string {
  return btoa(encodeURIComponent(data).split('').reverse().join(''));
}

function decrypt(data: string): string {
  return decodeURIComponent(atob(data).split('').reverse().join(''));
}

export const secureStorage = {
  set: <T>(key: string, value: T): void => {
    const encrypted = encrypt(JSON.stringify(value));
    localStorage.setItem(ENCRYPTION_KEY + ':' + key, encrypted);
  },
  get: <T>(key: string): T | null => {
    const encrypted = localStorage.getItem(ENCRYPTION_KEY + ':' + key);
    if (!encrypted) return null;
    try { return JSON.parse(decrypt(encrypted)) as T; } catch { return null; }
  },
  remove: (key: string): void => localStorage.removeItem(ENCRYPTION_KEY + ':' + key),
  clear: (): void => {
    Object.keys(localStorage)
      .filter(k => k.startsWith(ENCRYPTION_KEY + ':'))
      .forEach(k => localStorage.removeItem(k));
  },
};
