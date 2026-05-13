import { useRef, useEffect } from 'react';
export function useLatest<T>(value) {
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value]);
  return ref;
}