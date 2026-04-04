import { useRef, useCallback, useEffect } from "react";

export function useRaf(callback: (deltaTime) => void, active = true) {
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const loop = useCallback((time) => {
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    callback(delta);
    rafRef.current = requestAnimationFrame(loop);
  }, [callback]);

  useEffect(() => {
    if (active) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, loop]);
}
