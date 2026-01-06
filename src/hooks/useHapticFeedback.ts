import { useCallback } from "react";

type HapticType = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error";

const vibrationPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  selection: 5,
  success: [10, 50, 10],
  warning: [20, 50, 20],
  error: [30, 50, 30, 50, 30],
};

export function useHapticFeedback() {
  const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

  const trigger = useCallback((type: HapticType = "light") => {
    if (!isSupported) return false;
    try {
      navigator.vibrate(vibrationPatterns[type]);
      return true;
    } catch {
      return false;
    }
  }, [isSupported]);

  const light = useCallback(() => trigger("light"), [trigger]);
  const medium = useCallback(() => trigger("medium"), [trigger]);
  const heavy = useCallback(() => trigger("heavy"), [trigger]);
  const selection = useCallback(() => trigger("selection"), [trigger]);
  const success = useCallback(() => trigger("success"), [trigger]);
  const warning = useCallback(() => trigger("warning"), [trigger]);
  const error = useCallback(() => trigger("error"), [trigger]);

  return { isSupported, trigger, light, medium, heavy, selection, success, warning, error };
}

export default useHapticFeedback;
