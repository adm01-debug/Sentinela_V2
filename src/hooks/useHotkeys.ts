import { useEffect, useCallback } from "react";

type HotkeyHandler = (e: KeyboardEvent) => void;
type HotkeyMap = Record<string, HotkeyHandler>;

export function useHotkeys(keyMap: HotkeyMap, deps: unknown[] = []) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && "ctrl",
        e.altKey && "alt",
        e.shiftKey && "shift",
        e.metaKey && "meta",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      const handler = keyMap[key];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    },
    // `deps` is a caller-supplied dependency list spread intentionally so the
    // handler tracks the consumer's own dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyMap, ...deps]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
