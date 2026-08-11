import { useState, useCallback, useRef, KeyboardEvent } from 'react';

export interface UseRovingTabIndexOptions {
  initialIndex?: number;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
}

export interface UseRovingTabIndexReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  getTabIndex: (index: number) => number;
  handleKeyDown: (e: KeyboardEvent, index: number, totalItems: number) => void;
  focusItem: (index: number) => void;
  itemRefs: React.MutableRefObject<(HTMLElement | null)[]>;
}

export function useRovingTabIndex(options: UseRovingTabIndexOptions = {}): UseRovingTabIndexReturn {
  const { initialIndex = 0, loop = true, orientation = 'both' } = options;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const focusItem = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item) {
      item.focus();
      setActiveIndex(index);
    }
  }, []);

  const getNextIndex = useCallback((current: number, total: number, direction: 1 | -1): number => {
    const next = current + direction;
    if (loop) return (next + total) % total;
    return Math.max(0, Math.min(total - 1, next));
  }, [loop]);

  const handleKeyDown = useCallback((e: KeyboardEvent, index: number, totalItems: number) => {
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    const isVertical = orientation === 'vertical' || orientation === 'both';
    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight': if (isHorizontal) nextIndex = getNextIndex(index, totalItems, 1); break;
      case 'ArrowLeft': if (isHorizontal) nextIndex = getNextIndex(index, totalItems, -1); break;
      case 'ArrowDown': if (isVertical) nextIndex = getNextIndex(index, totalItems, 1); break;
      case 'ArrowUp': if (isVertical) nextIndex = getNextIndex(index, totalItems, -1); break;
      case 'Home': nextIndex = 0; break;
      case 'End': nextIndex = totalItems - 1; break;
    }

    if (nextIndex !== null) { e.preventDefault(); focusItem(nextIndex); }
  }, [orientation, getNextIndex, focusItem]);

  const getTabIndex = useCallback((index: number) => index === activeIndex ? 0 : -1, [activeIndex]);

  return { activeIndex, setActiveIndex, getTabIndex, handleKeyDown, focusItem, itemRefs };
}

export default useRovingTabIndex;
