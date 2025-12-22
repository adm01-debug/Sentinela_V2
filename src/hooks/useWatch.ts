import { useEffect, useRef } from 'react';

export function useWatch<T>(
  value: T,
  callback: (value: T, prevValue: T | undefined) => void
) {
  const prevRef = useRef<T>();

  useEffect(() => {
    callback(value, prevRef.current);
    prevRef.current = value;
  }, [value, callback]);
}
