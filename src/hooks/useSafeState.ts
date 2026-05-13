import { useState, useCallback, useRef, useEffect } from "react";

export function useSafeState<T>(initialValue: T): [T, (value) => void] {
  const [state, setState] = useState(initialValue);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const setSafeState = useCallback((value) => {
    if (mountedRef.current) setState(value);
  }, []);

  return [state, setSafeState];
}
