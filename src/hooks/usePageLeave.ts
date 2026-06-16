import { useEffect, useCallback } from "react";

export function usePageLeave(onLeave: () => void) {
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 0) onLeave();
    },
    [onLeave]
  );

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);
}
