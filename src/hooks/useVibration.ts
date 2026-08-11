import { useCallback } from 'react';
export function useVibration() {
  const vibrate = useCallback((pattern: number | number[]) => navigator.vibrate?.(pattern), []);
  const stop = useCallback(() => navigator.vibrate?.(0), []);
  return { vibrate, stop };
}