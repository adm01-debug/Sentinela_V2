import { useRef } from "react";

export function useConstant<T>(fn: () => T): T {
  const ref = useRef<T | undefined>(undefined);
  const initialized = useRef(false);
  
  if (!initialized.current) {
    ref.current = fn();
    initialized.current = true;
  }
  
  return ref.current as T;
}
