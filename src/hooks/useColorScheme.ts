import { useState, useEffect, useCallback } from "react";

type ColorScheme = "light" | "dark" | "system";

export function useColorScheme() {
  const [scheme, setScheme] = useState<ColorScheme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("colorScheme") as ColorScheme;
    if (saved) setScheme(saved);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const isDark = scheme === "dark" || (scheme === "system" && mql.matches);
      setResolved(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    };
    
    mql.addEventListener("change", update);
    update();
    return () => mql.removeEventListener("change", update);
  }, [scheme]);

  const setColorScheme = useCallback((s: ColorScheme) => {
    setScheme(s);
    localStorage.setItem("colorScheme", s);
  }, []);

  return { scheme, resolved, setColorScheme };
}
