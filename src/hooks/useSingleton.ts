import { useRef } from "react";

const instances = new Map<string, unknown>();

export function useSingleton<T>(key: string, factory: () => T): T {
  const initialized = useRef(false);

  if (!initialized.current) {
    if (!instances.has(key)) {
      instances.set(key, factory());
    }
    initialized.current = true;
  }

  return instances.get(key) as T;
}
