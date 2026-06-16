import { useCallback, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounceCallback<T extends (...args: never[]) => unknown>(fn: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}
