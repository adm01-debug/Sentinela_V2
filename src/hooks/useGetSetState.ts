import { useCallback, useRef, useState } from "react";

export function useGetSetState<T extends object>(
  initialState: T
): [() => T, (patch: Partial<T>) => void] {
  const [, setTick] = useState(0);
  const state = useRef(initialState);

  const get = useCallback(() => state.current, []);
  const set = useCallback((patch: Partial<T>) => {
    state.current = { ...state.current, ...patch };
    setTick(t => t + 1);
  }, []);

  return [get, set];
}
