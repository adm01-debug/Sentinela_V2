import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme(defaultTheme: Theme = "system") {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || defaultTheme;
  });

  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(() => {
    setThemeState(t => t === "dark" ? "light" : "dark");
  }, []);

  return { theme, setTheme, toggle };
}
