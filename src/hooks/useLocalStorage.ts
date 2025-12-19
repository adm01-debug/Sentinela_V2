import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================
// TYPES
// ============================================================

type SetValue<T> = T | ((prevValue: T) => T);

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: Error) => void;
}

// ============================================================
// useLocalStorage - Persist state in localStorage
// ============================================================

/**
 * Like useState but persists to localStorage
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Serialization options
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError = console.error,
  } = options;

  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      onError(error as Error);
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function like useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore));
          
          // Dispatch custom event for cross-tab sync
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serializer(valueToStore),
            })
          );
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    [key, storedValue, serializer, onError]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, initialValue, onError]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(deserializer(event.newValue));
        } catch (error) {
          onError(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserializer, onError]);

  return [storedValue, setValue, removeValue];
}

// ============================================================
// useSessionStorage - Persist state in sessionStorage
// ============================================================

/**
 * Like useState but persists to sessionStorage
 * Data is cleared when session ends
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError = console.error,
  } = options;

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      onError(error as Error);
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    [key, storedValue, serializer, onError]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, initialValue, onError]);

  return [storedValue, setValue, removeValue];
}

// ============================================================
// useStorageState - Generic storage hook
// ============================================================

type StorageType = 'local' | 'session';

/**
 * Generic hook that works with both localStorage and sessionStorage
 */
export function useStorageState<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local',
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  if (storageType === 'session') {
    return useSessionStorage(key, initialValue, options);
  }
  return useLocalStorage(key, initialValue, options);
}

// ============================================================
// Preset hooks for common use cases
// ============================================================

/**
 * Persist theme preference
 */
export function useThemeStorage() {
  return useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
}

/**
 * Persist sidebar collapsed state
 */
export function useSidebarStorage() {
  return useLocalStorage<boolean>('sidebar-collapsed', false);
}

/**
 * Persist table page size preference
 */
export function usePageSizeStorage(tableId: string) {
  return useLocalStorage<number>(`table-pagesize-${tableId}`, 10);
}

/**
 * Persist table column visibility
 */
export function useColumnVisibilityStorage(tableId: string) {
  return useLocalStorage<Record<string, boolean>>(`table-columns-${tableId}`, {});
}
