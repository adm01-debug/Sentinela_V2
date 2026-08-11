import { useState, useCallback } from 'react';

export function useUndo<T>(initial: T) {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });

  const set = useCallback((val: T) => setState(s => ({
    past: [...s.past, s.present], present: val, future: []
  })), []);

  const undo = useCallback(() => setState(s => {
    if (s.past.length === 0) return s;
    const prev = s.past[s.past.length - 1];
    return { past: s.past.slice(0, -1), present: prev, future: [s.present, ...s.future] };
  }), []);

  const redo = useCallback(() => setState(s => {
    if (s.future.length === 0) return s;
    const next = s.future[0];
    return { past: [...s.past, s.present], present: next, future: s.future.slice(1) };
  }), []);

  return { value: state.present, set, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}