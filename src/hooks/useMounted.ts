import { useState, useEffect, useRef, useCallback } from "react";

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setMounted(true);
    return () => { mountedRef.current = false; };
  }, []);

  const isMounted = useCallback(() => mountedRef.current, []);

  return { mounted, isMounted };
}
