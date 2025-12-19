import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================
// useDebounce - Debounce a value
// ============================================================

/**
 * Debounces a value, returning the debounced version after delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// useDebouncedCallback - Debounce a function
// ============================================================

/**
 * Returns a debounced version of a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

// ============================================================
// useThrottle - Throttle a value
// ============================================================

/**
 * Throttles a value, only updating at most once per interval
 * @param value - The value to throttle
 * @param interval - Minimum interval between updates in milliseconds (default: 300)
 */
export function useThrottle<T>(value: T, interval = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// ============================================================
// useDebouncedState - State with built-in debounce
// ============================================================

/**
 * Like useState but with built-in debouncing
 * Returns both the immediate value and the debounced value
 * @param initialValue - Initial state value
 * @param delay - Debounce delay in milliseconds (default: 300)
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay = 300
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, debouncedValue, setValue];
}

// ============================================================
// useSearchDebounce - Optimized for search inputs
// ============================================================

/**
 * Specialized debounce hook for search functionality
 * Includes loading state and cancel capability
 */
export function useSearchDebounce(delay = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  const previousSearchTerm = useRef(searchTerm);

  // Track when search term changes to show loading state
  useEffect(() => {
    if (searchTerm !== previousSearchTerm.current) {
      setIsSearching(true);
      previousSearchTerm.current = searchTerm;
    }
  }, [searchTerm]);

  // Clear loading state when debounced value catches up
  useEffect(() => {
    if (debouncedSearchTerm === searchTerm) {
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    clearSearch,
  };
}
