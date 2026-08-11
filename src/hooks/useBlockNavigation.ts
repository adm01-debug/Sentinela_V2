import { useState, useCallback, useEffect } from "react";

export function useBlockNavigation(when: boolean, message = "Changes may not be saved") {
  const [blocked, setBlocked] = useState(when);

  useEffect(() => setBlocked(when), [when]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!blocked) return;
    e.preventDefault();
    e.returnValue = message;
  }, [blocked, message]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const allowNavigation = useCallback(() => setBlocked(false), []);
  const blockNavigation = useCallback(() => setBlocked(true), []);

  return { blocked, allowNavigation, blockNavigation };
}
