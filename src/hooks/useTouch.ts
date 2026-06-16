import { useState, useCallback } from "react";

interface TouchState {
  x: number;
  y: number;
  touching: boolean;
}

export function useTouch() {
  const [state, setState] = useState<TouchState>({ x: 0, y: 0, touching: false });

  const handlers = {
    onTouchStart: useCallback((e: React.TouchEvent) => {
      setState({ x: e.touches[0].clientX, y: e.touches[0].clientY, touching: true });
    }, []),
    onTouchMove: useCallback((e: React.TouchEvent) => {
      setState((s) => ({ ...s, x: e.touches[0].clientX, y: e.touches[0].clientY }));
    }, []),
    onTouchEnd: useCallback(() => {
      setState((s) => ({ ...s, touching: false }));
    }, []),
  };

  return { ...state, handlers };
}
