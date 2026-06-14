import { useState, useEffect } from "react";

export function useRouteParams<T extends Record<string, string>>(pattern: string): T {
  const [params, setParams] = useState<T>({} as T);

  useEffect(() => {
    const extractParams = () => {
      const patternParts = pattern.split("/");
      const pathParts = window.location.pathname.split("/");
      const extracted: Record<string, string> = {};

      patternParts.forEach((part: string, i: number) => {
        if (part.startsWith(":")) {
          extracted[part.slice(1)] = pathParts[i] || "";
        }
      });

      setParams(extracted as T);
    };

    extractParams();
    window.addEventListener("popstate", extractParams);
    return () => window.removeEventListener("popstate", extractParams);
  }, [pattern]);

  return params;
}
