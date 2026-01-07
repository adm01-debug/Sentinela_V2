import { useState, useEffect, useCallback } from 'react';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface UseColorBlindModeOptions {
  defaultMode?: ColorBlindMode;
  storageKey?: string;
}

const COLOR_FILTERS: Record<ColorBlindMode, string> = {
  none: 'none',
  protanopia: 'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia: 'url(#tritanopia)',
  achromatopsia: 'grayscale(100%)',
};

export function useColorBlindMode(options: UseColorBlindModeOptions = {}) {
  const { defaultMode = 'none', storageKey = 'color-blind-mode' } = options;
  const [mode, setMode] = useState<ColorBlindMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    return (localStorage.getItem(storageKey) as ColorBlindMode) || defaultMode;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.filter = COLOR_FILTERS[mode];
    root.setAttribute('data-color-blind-mode', mode);
    localStorage.setItem(storageKey, mode);
  }, [mode, storageKey]);

  const setColorBlindMode = useCallback((newMode: ColorBlindMode) => setMode(newMode), []);
  const resetMode = useCallback(() => setMode('none'), []);

  const SVGFilters = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" /></filter>
        <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" /></filter>
        <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" /></filter>
      </defs>
    </svg>
  );

  return { mode, setColorBlindMode, resetMode, SVGFilters, availableModes: Object.keys(COLOR_FILTERS) as ColorBlindMode[] };
}

export default useColorBlindMode;
