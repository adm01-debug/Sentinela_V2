import { useState, useCallback, useEffect } from "react";

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

export function useContextMenu() {
  const [state, setState] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0 });

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setState({ isOpen: true, x: e.clientX, y: e.clientY });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  useEffect(() => {
    const handler = () => close();
    document.addEventListener("click", handler);
    document.addEventListener("scroll", handler);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("scroll", handler);
    };
  }, [close]);

  return { ...state, open, close };
}
