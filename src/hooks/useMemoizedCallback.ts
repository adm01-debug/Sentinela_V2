import { useCallback, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMemoizedCallback<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T;
}
