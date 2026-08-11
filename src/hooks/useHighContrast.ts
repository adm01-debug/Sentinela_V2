import { useState, useEffect, useCallback } from 'react';

export interface UseHighContrastOptions {
  defaultEnabled?: boolean;
  storageKey?: string;
}

export interface UseHighContrastReturn {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  enableHighContrast: () => void;
  disableHighContrast: () => void;
}

export function useHighContrast(options: UseHighContrastOptions = {}): UseHighContrastReturn {
  const { defaultEnabled = false, storageKey = 'high-contrast-mode' } = options;
  
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window === 'undefined') return defaultEnabled;
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-contrast: more)').matches || defaultEnabled;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
      root.style.setProperty('--contrast-multiplier', '1.5');
    } else {
      root.classList.remove('high-contrast');
      root.style.removeProperty('--contrast-multiplier');
    }
    localStorage.setItem(storageKey, String(isHighContrast));
  }, [isHighContrast, storageKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleHighContrast = useCallback(() => setIsHighContrast(prev => !prev), []);
  const enableHighContrast = useCallback(() => setIsHighContrast(true), []);
  const disableHighContrast = useCallback(() => setIsHighContrast(false), []);

  return { isHighContrast, toggleHighContrast, enableHighContrast, disableHighContrast };
}

export default useHighContrast;
