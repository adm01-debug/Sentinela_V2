import { useState, useCallback } from "react";

export function useHistory<T>(initialValue: T, maxHistory = 50) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);

  const value = history[index];

  const push = useCallback((newValue: T) => {
    setHistory(h => {
      const newHistory = h.slice(0, index + 1);
      newHistory.push(newValue);
      if (newHistory.length > maxHistory) newHistory.shift();
      return newHistory;
    });
    setIndex(i => Math.min(i + 1, maxHistory - 1));
  }, [index, maxHistory]);

  const undo = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const redo = useCallback(() => setIndex(i => Math.min(history.length - 1, i + 1)), [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { value, push, undo, redo, canUndo, canRedo, history };
}
