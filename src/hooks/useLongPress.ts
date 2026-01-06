import { useRef, useCallback, MouseEvent, TouchEvent } from 'react';

export interface UseLongPressOptions {
  onLongPress: (e: MouseEvent | TouchEvent) => void;
  onClick?: (e: MouseEvent | TouchEvent) => void;
  delay?: number;
  shouldPreventDefault?: boolean;
}

export function useLongPress(options: UseLongPressOptions) {
  const { onLongPress, onClick, delay = 500, shouldPreventDefault = true } = options;
  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback((e: MouseEvent | TouchEvent) => {
    if (shouldPreventDefault && e.target) {
      e.target.addEventListener('contextmenu', (ev) => ev.preventDefault(), { once: true });
    }
    targetRef.current = e.target;
    isLongPress.current = false;
    timerRef.current = setTimeout(() => { isLongPress.current = true; onLongPress(e); }, delay);
  }, [onLongPress, delay, shouldPreventDefault]);

  const clear = useCallback((e: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (shouldTriggerClick && !isLongPress.current && onClick) onClick(e);
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseUp: (e: MouseEvent) => clear(e),
    onMouseLeave: (e: MouseEvent) => clear(e, false),
    onTouchStart: start,
    onTouchEnd: (e: TouchEvent) => clear(e),
  };
}

export default useLongPress;
