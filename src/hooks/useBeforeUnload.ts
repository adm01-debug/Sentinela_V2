import { useEffect, useCallback } from "react";

export function useBeforeUnload(enabled = true, message?: string) {
  const handler = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.returnValue = message || "";
      return message;
    },
    [enabled, message]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [handler]);
}
