import { useRef, useCallback, TouchEvent } from "react";

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface UseSwipeGesturesOptions extends SwipeHandlers {
  threshold?: number;
  timeout?: number;
}

export function useSwipeGestures(options: UseSwipeGesturesOptions = {}) {
  const {
    threshold = 50,
    timeout = 500,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart.current) return;
      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      if (deltaTime > timeout) {
        touchStart.current = null;
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY && absX > threshold) {
        if (deltaX > 0) onSwipeRight?.();
        else onSwipeLeft?.();
      } else if (absY > absX && absY > threshold) {
        if (deltaY > 0) onSwipeDown?.();
        else onSwipeUp?.();
      }
      touchStart.current = null;
    },
    [threshold, timeout, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  );

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}

export default useSwipeGestures;
