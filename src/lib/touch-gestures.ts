import { useRef, useCallback, TouchEvent } from 'react';

export interface TouchGestureHandlers {
  onTap?: (e: TouchEvent) => void;
  onDoubleTap?: (e: TouchEvent) => void;
  onLongPress?: (e: TouchEvent) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
}

export function useTouchGestures(handlers: TouchGestureHandlers) {
  const touchStart = useRef<{ x: number; y: number; time: number; touches: number } | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const initialDistance = useRef<number | null>(null);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const [t1, t2] = [touches[0], touches[1]];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now(), touches: e.touches.length };
    if (e.touches.length === 2) initialDistance.current = getDistance(e.touches);
    
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.(e);
        touchStart.current = null;
      }, 500);
    }
  }, [handlers]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = undefined; }
    
    if (e.touches.length === 2 && initialDistance.current) {
      const currentDistance = getDistance(e.touches);
      if (currentDistance) {
        const diff = currentDistance - initialDistance.current;
        if (diff > 50) handlers.onPinchOut?.();
        else if (diff < -50) handlers.onPinchIn?.();
      }
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = undefined; }
    if (!touchStart.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Swipe detection
    if (deltaTime < 300 && (absX > 50 || absY > 50)) {
      if (absX > absY) { deltaX > 0 ? handlers.onSwipeRight?.() : handlers.onSwipeLeft?.(); }
      else { deltaY > 0 ? handlers.onSwipeDown?.() : handlers.onSwipeUp?.(); }
    }
    // Tap detection
    else if (deltaTime < 200 && absX < 10 && absY < 10) {
      const now = Date.now();
      if (now - lastTap.current < 300) { handlers.onDoubleTap?.(e); lastTap.current = 0; }
      else { handlers.onTap?.(e); lastTap.current = now; }
    }

    touchStart.current = null;
    initialDistance.current = null;
  }, [handlers]);

  return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd };
}
