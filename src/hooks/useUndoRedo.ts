import { useState, useCallback } from 'react';
export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);
  const state = history[index];
  const set = useCallback((newState: T | ((prev: T) => T)) => {
    const value = typeof newState === 'function' ? (newState as (prev: T) => T)(history[index]) : newState;
    const newHistory = history.slice(0, index + 1);
    setHistory([...newHistory, value]);
    setIndex(newHistory.length);
  }, [history, index]);
  const undo = useCallback(() => { if (index > 0) setIndex(i => i - 1); }, [index]);
  const redo = useCallback(() => { if (index < history.length - 1) setIndex(i => i + 1); }, [index, history.length]);
  return { state, set, undo, redo, canUndo: index > 0, canRedo: index < history.length - 1, history, index };
}
export default useUndoRedo;
