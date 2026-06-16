import { useCallback, useRef, useLayoutEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEvent<T extends (...args: unknown[]) => unknown>(handler: T): T {
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback((...args: Parameters<T>) => handlerRef.current(...args), []) as T;
}
