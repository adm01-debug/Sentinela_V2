import { useState, useCallback, useRef } from "react";

export function useStateWithHistory<T>(initial: T) {
  const [state, setState] = useState(initial);
  const historyRef = useRef<T[]>([initial]);
  const indexRef = useRef(0);

  const set = useCallback((value) => {
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(value);
    indexRef.current++;
    setState(value);
  }, []);

  const back = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--;
      setState(historyRef.current[indexRef.current]);
    }
  }, []);

  const forward = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      setState(historyRef.current[indexRef.current]);
    }
  }, []);

  return { state, set, back, forward, history: historyRef.current };
}
