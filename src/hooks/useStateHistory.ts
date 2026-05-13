import { useState, useCallback, useRef } from "react";

export function useStateHistory<T>(initial: T, capacity = 10) {
  const [state, setState] = useState(initial);
  const history = useRef<T[]>([initial]);
  const position = useRef(0);

  const set = useCallback((value: any) => {
    history.current = history.current.slice(0, position.current + 1);
    history.current.push(value);
    if (history.current.length > capacity) history.current.shift();
    else position.current++;
    setState(value);
  }, [capacity]);

  const undo = useCallback(() => {
    if (position.current > 0) {
      position.current--;
      setState(history.current[position.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (position.current < history.current.length - 1) {
      position.current++;
      setState(history.current[position.current]);
    }
  }, []);

  return { state, set, undo, redo, canUndo: position.current > 0, canRedo: position.current < history.current.length - 1 };
}
