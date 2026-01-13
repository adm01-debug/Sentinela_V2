import { useState, useEffect, useCallback } from "react";

type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

export function useColorBlindModex() {
  const [mode, setMode] = useState<ColorBlindMode>("none");

  useEffect(() => {
    const saved = localStorage.getItem("colorBlindMode") as ColorBlindMode;
    if (saved) setMode(saved);
  }, []);

  const setColorBlindMode = useCallback((newMode: ColorBlindMode) => {
    setMode(newMode);
    localStorage.setItem("colorBlindMode", newMode);
    document.documentElement.setAttribute("data-color-blind-mode", newMode);
  }, []);

  return { mode, setColorBlindMode };
}
