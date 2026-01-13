import { useState, useEffect, useCallback, useMemo } from 'react';

type ColorBlindMode = 
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly';

interface ColorBlindModeConfig {
  mode: ColorBlindMode;
  label: string;
  description: string;
  cssFilter: string;
}

interface UseColorBlindModeOptions {
  defaultMode?: ColorBlindMode;
  persistKey?: string;
  applyToBody?: boolean;
}

interface UseColorBlindModeReturn {
  mode: ColorBlindMode;
  setMode: (mode: ColorBlindMode) => void;
  toggleMode: () => void;
  availableModes: ColorBlindModeConfig[];
  currentConfig: ColorBlindModeConfig;
  isSimulating: boolean;
  resetToNormal: () => void;
  getCssFilter: () => string;
}

const COLOR_BLIND_MODES: ColorBlindModeConfig[] = [
  { mode: 'normal', label: 'Normal Vision', description: 'No color vision deficiency', cssFilter: 'none' },
  { mode: 'protanopia', label: 'Protanopia', description: 'Red-blind (no red cones)', cssFilter: 'url(#protanopia)' },
  { mode: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind (no green cones)', cssFilter: 'url(#deuteranopia)' },
  { mode: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind (no blue cones)', cssFilter: 'url(#tritanopia)' },
  { mode: 'achromatopsia', label: 'Achromatopsia', description: 'Complete color blindness', cssFilter: 'grayscale(100%)' },
  { mode: 'protanomaly', label: 'Protanomaly', description: 'Red-weak (reduced red)', cssFilter: 'url(#protanomaly)' },
  { mode: 'deuteranomaly', label: 'Deuteranomaly', description: 'Green-weak (reduced green)', cssFilter: 'url(#deuteranomaly)' },
  { mode: 'tritanomaly', label: 'Tritanomaly', description: 'Blue-weak (reduced blue)', cssFilter: 'url(#tritanomaly)' },
];

export function useColorBlindMode(options: UseColorBlindModeOptions = {}): UseColorBlindModeReturn {
  const {
    defaultMode = 'normal',
    persistKey = 'colorBlindMode',
    applyToBody = true,
  } = options;

  const [mode, setModeState] = useState<ColorBlindMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    const saved = localStorage.getItem(persistKey);
    return (saved as ColorBlindMode) || defaultMode;
  });

  const setMode = useCallback((newMode: ColorBlindMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(persistKey, newMode);
    }
  }, [persistKey]);

  const toggleMode = useCallback(() => {
    const currentIndex = COLOR_BLIND_MODES.findIndex(m => m.mode === mode);
    const nextIndex = (currentIndex + 1) % COLOR_BLIND_MODES.length;
    setMode(COLOR_BLIND_MODES[nextIndex].mode);
  }, [mode, setMode]);

  const resetToNormal = useCallback(() => {
    setMode('normal');
  }, [setMode]);

  const currentConfig = useMemo(() => {
    return COLOR_BLIND_MODES.find(m => m.mode === mode) || COLOR_BLIND_MODES[0];
  }, [mode]);

  const getCssFilter = useCallback(() => currentConfig.cssFilter, [currentConfig]);

  const isSimulating = mode !== 'normal';

  useEffect(() => {
    if (!applyToBody || typeof document === 'undefined') return;
    
    document.body.style.filter = currentConfig.cssFilter;
    document.body.setAttribute('data-color-blind-mode', mode);

    return () => {
      document.body.style.filter = 'none';
      document.body.removeAttribute('data-color-blind-mode');
    };
  }, [mode, currentConfig, applyToBody]);

  return {
    mode,
    setMode,
    toggleMode,
    availableModes: COLOR_BLIND_MODES,
    currentConfig,
    isSimulating,
    resetToNormal,
    getCssFilter,
  };
}

export default useColorBlindMode;
