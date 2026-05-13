import { useCallback, useRef, useState } from "react";

export function useGetSet<T>(initialValue: T): [() => T, (value: T) => void] {
  const [, setTick] = useState(0);
  const state = useRef(initialValue);

  const get = useCallback(() => state.current, []);
  const set = useCallback((value: T) => {
    state.current = value;
    setTick(t => t + 1);
  }, []);

  return [get, set];
}
