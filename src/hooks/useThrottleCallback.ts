import { useCallback, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottleCallback<T extends (...args: never[]) => unknown>(fn: T, delay) {
  const lastCall = useRef(0);
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) { lastCall.current = now; fn(...args); }
  }, [fn, delay]);
}
