import { useRef, useCallback } from "react";

export function useScrollIntoView<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      ...options,
    });
  }, []);

  return { ref, scrollIntoView };
}
