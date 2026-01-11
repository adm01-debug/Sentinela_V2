import { useState, useCallback } from 'react';
import { encrypt, decrypt } from '@/lib/security/encryption';

export function useSecureStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(decrypt(item)) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, encrypt(JSON.stringify(valueToStore)));
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
