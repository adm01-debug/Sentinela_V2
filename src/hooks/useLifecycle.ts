import { useEffect, useRef } from "react";

export function useLifecycle(onMount?: () => void | (() => void), onUnmount?: () => void) {
  const mountRef = useRef(onMount);
  const unmountRef = useRef(onUnmount);

  mountRef.current = onMount;
  unmountRef.current = onUnmount;

  useEffect(() => {
    const result = mountRef.current?.();
    return () => {
      if (typeof result === "function") {
        result();
      }
      unmountRef.current?.();
    };
  }, []);
}
