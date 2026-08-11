import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  warning: [20, 30, 20],
  error: [30, 20, 30, 20, 30],
  selection: [5],
};

export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const trigger = useCallback((pattern: HapticPattern | number[]) => {
    if (!isSupported) return false;
    const vibrationPattern = Array.isArray(pattern) ? pattern : PATTERNS[pattern];
    return navigator.vibrate(vibrationPattern);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) navigator.vibrate(0);
  }, [isSupported]);

  return { isSupported, trigger, stop, patterns: PATTERNS };
}

export default useHapticFeedback;
