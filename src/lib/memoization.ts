import { useMemo, useCallback, useRef, DependencyList } from 'react';

// Deep comparison memoization
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T }>();
  
  if (!ref.current || !deepEqual(deps, ref.current.deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
}

// Deep comparison callback
export function useDeepCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; callback: T }>();
  
  if (!ref.current || !deepEqual(deps, ref.current.deps)) {
    ref.current = { deps, callback };
  }
  
  return ref.current.callback;
}

// Memoize expensive computations with cache
export function createMemoizedSelector<Args extends any[], Result>(
  selector: (...args: Args) => Result,
  maxCacheSize = 10
) {
  const cache = new Map<string, Result>();
  const keyOrder: string[] = [];

  return (...args: Args): Result => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = selector(...args);
    
    if (keyOrder.length >= maxCacheSize) {
      const oldestKey = keyOrder.shift()!;
      cache.delete(oldestKey);
    }
    
    cache.set(key, result);
    keyOrder.push(key);
    
    return result;
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  }) as T;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T & { cancel: () => void };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

// Deep equality check
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => deepEqual(a[key], b[key]));
}

export { deepEqual };
