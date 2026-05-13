import { useState, useRef, useCallback } from "react";

export function useRafState<T>(initialValue: T): [T, (value) => void] {
  const [state, setState] = useState(initialValue);
  const rafRef = useRef<number>();

  const setRafState = useCallback((value) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setState(value));
  }, []);

  return [state, setRafState];
}
