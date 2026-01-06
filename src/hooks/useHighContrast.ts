import { useState, useEffect, useCallback } from "react";

export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("highContrast") === "true" || window.matchMedia("(prefers-contrast: more)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", isHighContrast);
    localStorage.setItem("highContrast", String(isHighContrast));
  }, [isHighContrast]);

  const toggle = useCallback(() => setIsHighContrast((prev) => !prev), []);
  const enable = useCallback(() => setIsHighContrast(true), []);
  const disable = useCallback(() => setIsHighContrast(false), []);

  return { isHighContrast, toggle, enable, disable };
}

export default useHighContrast;
