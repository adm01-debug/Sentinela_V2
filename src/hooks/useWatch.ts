import { useEffect, useRef } from 'react';

export function useWatch<T>(
  value: T,
  callback: (value: T, previous: T | undefined) => void
) {
  const prevRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    callback(value, prevRef.current);
    prevRef.current = value;
  }, [value, callback]);
}
