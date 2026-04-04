import { useState, useEffect, useCallback } from "react";

export function useHash() {
  const [hash, setHashState] = useState(() => window.location.hash.slice(1));

  useEffect(() => {
    const handler = () => setHashState(window.location.hash.slice(1));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const setHash = useCallback((newHash) => {
    window.location.hash = newHash;
  }, []);

  return [hash, setHash] as const;
}
