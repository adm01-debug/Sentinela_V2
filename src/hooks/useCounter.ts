import { useState, useCallback } from 'react';

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);
  const set = useCallback((n: number) => setCount(n), []);
  return { count, increment, decrement, reset, set };
}