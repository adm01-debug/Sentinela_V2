import { useRef, useCallback, TouchEvent } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface UseSwipeGesturesOptions extends SwipeHandlers {
  threshold?: number;
  preventScroll?: boolean;
}

export function useSwipeGestures(options: UseSwipeGesturesOptions = {}) {
  const { threshold = 50, preventScroll = false, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = options;
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchEnd.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    touchEnd.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (preventScroll) e.preventDefault();
  }, [preventScroll]);

  const onTouchEnd = useCallback(() => {
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) > threshold) {
      if (absX > absY) {
        deltaX > 0 ? onSwipeRight?.() : onSwipeLeft?.();
      } else {
        deltaY > 0 ? onSwipeDown?.() : onSwipeUp?.();
      }
    }
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return { onTouchStart, onTouchMove, onTouchEnd, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
}

export default useSwipeGestures;
