import { useEffect, useCallback } from "react";

type HotkeyHandler = (e: KeyboardEvent) => void;
type HotkeyMap = Record<string, HotkeyHandler>;

export function useHotkeys(keyMap: HotkeyMap, deps: unknown[] = []) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = [
      e.ctrlKey && "ctrl",
      e.altKey && "alt",
      e.shiftKey && "shift",
      e.metaKey && "meta",
      e.key.toLowerCase()
    ].filter(Boolean).join("+");

    const handler = keyMap[key];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  }, [keyMap, ...deps]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
