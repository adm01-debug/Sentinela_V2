import { useRef } from "react";

export function useConst<T>(initialValue: T | (() => T)): T {
  const ref = useRef<{ value: T } | null>(null);

  if (ref.current === null) {
    ref.current = {
      value: typeof initialValue === "function" ? (initialValue as () => T)() : initialValue,
    };
  }

  return ref.current.value;
}
