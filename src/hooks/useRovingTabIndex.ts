import { useState, useCallback, useRef, KeyboardEvent } from "react";

interface UseRovingTabIndexOptions {
  initialIndex?: number;
  loop?: boolean;
  orientation?: "horizontal" | "vertical" | "both";
}

export function useRovingTabIndex<T extends HTMLElement>(
  itemCount: number,
  options: UseRovingTabIndexOptions = {}
) {
  const { initialIndex = 0, loop = true, orientation = "vertical" } = options;
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemRefs = useRef<(T | null)[]>([]);

  const setItemRef = useCallback((index: number) => (el: T | null) => {
    itemRefs.current[index] = el;
  }, []);

  const focusItem = useCallback((index: number) => {
    const clampedIndex = loop
      ? ((index % itemCount) + itemCount) % itemCount
      : Math.max(0, Math.min(index, itemCount - 1));
    setFocusedIndex(clampedIndex);
    itemRefs.current[clampedIndex]?.focus();
  }, [itemCount, loop]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isVertical = orientation === "vertical" || orientation === "both";
    const isHorizontal = orientation === "horizontal" || orientation === "both";

    switch (e.key) {
      case "ArrowDown":
        if (isVertical) { e.preventDefault(); focusItem(focusedIndex + 1); }
        break;
      case "ArrowUp":
        if (isVertical) { e.preventDefault(); focusItem(focusedIndex - 1); }
        break;
      case "ArrowRight":
        if (isHorizontal) { e.preventDefault(); focusItem(focusedIndex + 1); }
        break;
      case "ArrowLeft":
        if (isHorizontal) { e.preventDefault(); focusItem(focusedIndex - 1); }
        break;
      case "Home":
        e.preventDefault(); focusItem(0);
        break;
      case "End":
        e.preventDefault(); focusItem(itemCount - 1);
        break;
    }
  }, [focusedIndex, focusItem, itemCount, orientation]);

  const getItemProps = useCallback((index: number) => ({
    ref: setItemRef(index),
    tabIndex: index === focusedIndex ? 0 : -1,
    onKeyDown: handleKeyDown,
    onFocus: () => setFocusedIndex(index),
  }), [focusedIndex, handleKeyDown, setItemRef]);

  return { focusedIndex, setFocusedIndex: focusItem, getItemProps };
}

export default useRovingTabIndex;
