import { useCallback, useRef } from "react";

export function useSkipLinksx() {
  const mainRef = useRef<HTMLElement>(null);

  const skipToMain = useCallback(() => {
    mainRef.current?.focus();
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return { mainRef, skipToMain };
}
