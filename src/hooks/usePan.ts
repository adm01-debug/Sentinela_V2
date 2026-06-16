import { useState, useCallback } from "react";

interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

export function usePan() {
  const [state, setState] = useState<PanState>({
    isPanning: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const onPanStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const point = "touches" in e ? e.touches[0] : e;
    setState({
      isPanning: true,
      startX: point.clientX,
      startY: point.clientY,
      deltaX: 0,
      deltaY: 0,
    });
  }, []);

  const onPanMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!state.isPanning) return;
      const point = "touches" in e ? e.touches[0] : e;
      setState((s) => ({
        ...s,
        deltaX: point.clientX - s.startX,
        deltaY: point.clientY - s.startY,
      }));
    },
    [state.isPanning]
  );

  const onPanEnd = useCallback(() => {
    setState((s) => ({ ...s, isPanning: false }));
  }, []);

  return { ...state, onPanStart, onPanMove, onPanEnd };
}
