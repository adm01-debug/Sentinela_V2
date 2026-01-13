import { useCallback } from "react";

export function useVibrate() {
  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  }, []);

  const stop = useCallback(() => {
    if ("vibrate" in navigator) navigator.vibrate(0);
  }, []);

  return { vibrate, stop, supported: "vibrate" in navigator };
}
