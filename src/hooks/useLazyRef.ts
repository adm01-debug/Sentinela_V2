import { useRef, useCallback } from "react";

export function useLazyRef<T>(initializer: () => T) {
  const ref = useRef<T | null>(null);
  const initialized = useRef(false);

  const get = useCallback(() => {
    if (!initialized.current) {
      ref.current = initializer();
      initialized.current = true;
    }
    return ref.current as T;
  }, [initializer]);

  return { get, ref };
}
