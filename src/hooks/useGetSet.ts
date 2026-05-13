import { useCallback, useRef, useState } from "react";

export function useGetSet<T>(initialValue: T): [() => T, (value) => void] {
  const [, setTick] = useState(0);
  const state = useRef(initialValue);

  const get = useCallback(() => state.current, []);
  const set = useCallback((value) => {
    state.current = value;
    setTick(t => t + 1);
  }, []);

  return [get, set];
}
