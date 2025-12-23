const ENCRYPTION_KEY = 'sentinela-secure';

const encrypt = (data: string): string => btoa(encodeURIComponent(data));
const decrypt = (data: string): string => decodeURIComponent(atob(data));

export const secureStore = {
  get: <T>(key: string): T | null => {
    try {
      const v = localStorage.getItem(ENCRYPTION_KEY + ':' + key);
      return v ? JSON.parse(decrypt(v)) : null;
    } catch { return null; }
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(ENCRYPTION_KEY + ':' + key, encrypt(JSON.stringify(value)));
  },
  remove: (key: string): void => localStorage.removeItem(ENCRYPTION_KEY + ':' + key),
};
