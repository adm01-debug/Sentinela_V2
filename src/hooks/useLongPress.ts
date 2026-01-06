import { useRef, useCallback, MouseEvent, TouchEvent } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 500 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback((shouldTriggerClick = true) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (shouldTriggerClick && !isLongPress.current && onClick) onClick();
  }, [onClick]);

  const onMouseDown = useCallback((e: MouseEvent) => { if (e.button === 0) start(); }, [start]);
  const onMouseUp = useCallback(() => clear(), [clear]);
  const onMouseLeave = useCallback(() => clear(false), [clear]);
  const onTouchStart = useCallback(() => start(), [start]);
  const onTouchEnd = useCallback(() => clear(), [clear]);

  return { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, handlers: { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd } };
}

export default useLongPress;
