import { useCallback, useEffect, useRef } from "react";

export function useScrollLock() {
  const locked = useRef(false);
  const originalStyle = useRef("");

  const lock = useCallback(() => {
    if (locked.current) return;
    originalStyle.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    locked.current = true;
  }, []);

  const unlock = useCallback(() => {
    if (!locked.current) return;
    document.body.style.overflow = originalStyle.current;
    locked.current = false;
  }, []);

  useEffect(() => () => unlock(), [unlock]);

  return { lock, unlock, isLocked: locked.current };
}
