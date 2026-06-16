import { useState, useCallback } from "react";

interface GestureState {
  isGesturing: boolean;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

export function useGesture() {
  const [state, setState] = useState<GestureState>({
    isGesturing: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setState({
      isGesturing: true,
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
    });
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!state.isGesturing) return;
      const touch = e.touches[0];
      setState((s) => ({
        ...s,
        deltaX: touch.clientX - s.startX,
        deltaY: touch.clientY - s.startY,
      }));
    },
    [state.isGesturing]
  );

  const onTouchEnd = useCallback(() => {
    setState((s) => ({ ...s, isGesturing: false }));
  }, []);

  return { ...state, gestureProps: { onTouchStart, onTouchMove, onTouchEnd } };
}
