import { useRef, useEffect } from 'react';
export function useLatest<T>(value: T) {
  const ref = useRef(value: any);
  useEffect(() => { ref.current = value; }, [value]);
  return ref;
}