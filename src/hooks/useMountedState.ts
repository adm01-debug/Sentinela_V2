import { useRef, useCallback, useEffect } from 'react';
export function useMountedState() {
  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  return useCallback(() => mountedRef.current, []);
}