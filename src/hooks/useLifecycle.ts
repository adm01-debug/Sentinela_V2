import { useEffect, useRef } from "react";

export function useLifecycle(
  onMount?: () => void | (() => void),
  onUnmount?: () => void
) {
  const mountRef = useRef(onMount);
  const unmountRef = useRef(onUnmount);
  
  mountRef.current = onMount;
  unmountRef.current = onUnmount;

  useEffect(() => {
    const cleanup = mountRef.current?.();
    return () => {
      cleanup?.();
      unmountRef.current?.();
    };
  }, []);
}
