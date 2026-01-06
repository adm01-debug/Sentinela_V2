import { useState, useEffect, useCallback } from "react";

type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

const modeFilters: Record<ColorBlindMode, string> = {
  none: "none",
  protanopia: "url(#protanopia)",
  deuteranopia: "url(#deuteranopia)",
  tritanopia: "url(#tritanopia)",
  achromatopsia: "grayscale(100%)",
};

export function useColorBlindMode() {
  const [mode, setMode] = useState<ColorBlindMode>(() => {
    if (typeof window === "undefined") return "none";
    return (localStorage.getItem("colorBlindMode") as ColorBlindMode) || "none";
  });

  useEffect(() => {
    const filter = modeFilters[mode];
    document.documentElement.style.filter = filter === "none" ? "" : filter;
    localStorage.setItem("colorBlindMode", mode);
    return () => { document.documentElement.style.filter = ""; };
  }, [mode]);

  const setColorBlindMode = useCallback((newMode: ColorBlindMode) => setMode(newMode), []);
  const reset = useCallback(() => setMode("none"), []);

  return {
    mode,
    setMode: setColorBlindMode,
    reset,
    isActive: mode !== "none",
    availableModes: Object.keys(modeFilters) as ColorBlindMode[],
  };
}

export default useColorBlindMode;
