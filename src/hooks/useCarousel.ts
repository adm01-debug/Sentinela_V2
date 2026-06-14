import { useState, useCallback } from "react";

export function useCarousel<T>(items: T[], _autoPlay = false, _interval = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)));
  }, [items.length]);

  return {
    currentIndex,
    currentItem: items[currentIndex],
    next,
    prev,
    goTo,
    isFirst: currentIndex === 0,
    isLast: currentIndex === items.length - 1
  };
}
