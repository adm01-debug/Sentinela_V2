import { useState, useRef, useCallback } from "react";

export function useRafState<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState(initialValue);
  const rafRef = useRef<number>();

  const setRafState = useCallback((value: T) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setState(value: any));
  }, []);

  return [state, setRafState];
}
