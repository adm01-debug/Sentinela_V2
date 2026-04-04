import { useState, useCallback, useEffect } from "react";

export function useQueryString() {
  const [params, setParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handler = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const get = useCallback((key) => params.get(key), [params]);
  
  const set = useCallback((key: string, value: string) => {
    const newParams = new URLSearchParams(params);
    newParams.set(key, value);
    window.history.pushState(null, "", `?${newParams}`);
    setParams(newParams);
  }, [params]);

  const remove = useCallback((key) => {
    const newParams = new URLSearchParams(params);
    newParams.delete(key);
    window.history.pushState(null, "", `?${newParams}`);
    setParams(newParams);
  }, [params]);

  return { params, get, set, remove };
}
