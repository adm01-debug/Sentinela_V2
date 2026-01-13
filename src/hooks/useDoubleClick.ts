import { useCallback, useRef } from "react";

export function useDoubleClick(
  onSingleClick?: () => void,
  onDoubleClick?: () => void,
  delay = 250
) {
  const clickCount = useRef(0);
  const timer = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(() => {
    clickCount.current++;

    if (clickCount.current === 1) {
      timer.current = setTimeout(() => {
        if (clickCount.current === 1) onSingleClick?.();
        clickCount.current = 0;
      }, delay);
    } else if (clickCount.current === 2) {
      clearTimeout(timer.current);
      onDoubleClick?.();
      clickCount.current = 0;
    }
  }, [onSingleClick, onDoubleClick, delay]);

  return handleClick;
}
