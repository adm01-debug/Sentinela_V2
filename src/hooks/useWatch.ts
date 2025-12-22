import { useEffect, useRef } from 'react';

export function useWatch<T>(value: T, callback: (value: T, prev: T) => void) {
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      callback(value, prev.current);
      prev.current = value;
    }
  }, [value, callback]);
}