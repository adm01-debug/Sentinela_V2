// Keyboard navigation utilities
import { useEffect, useRef, useCallback } from 'react';

export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstElement) { e.preventDefault(); lastElement.focus(); }
      else if (!e.shiftKey && document.activeElement === lastElement) { e.preventDefault(); firstElement.focus(); }
    };
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
  return containerRef;
};

export const useKeyboardNavigation = (items: HTMLElement[], options = { wrap: true, orientation: 'vertical' as 'vertical' | 'horizontal' }) => {
  const currentIndex = useRef(0);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keys = options.orientation === 'vertical' ? { next: 'ArrowDown', prev: 'ArrowUp' } : { next: 'ArrowRight', prev: 'ArrowLeft' };
    if (e.key === keys.next) { currentIndex.current = options.wrap ? (currentIndex.current + 1) % items.length : Math.min(currentIndex.current + 1, items.length - 1); }
    else if (e.key === keys.prev) { currentIndex.current = options.wrap ? (currentIndex.current - 1 + items.length) % items.length : Math.max(currentIndex.current - 1, 0); }
    else if (e.key === 'Home') currentIndex.current = 0;
    else if (e.key === 'End') currentIndex.current = items.length - 1;
    else return;
    e.preventDefault();
    items[currentIndex.current]?.focus();
  }, [items, options]);
  return handleKeyDown;
};

export const skipLink = (targetId: string) => `<a href="#${targetId}" class="sr-only focus:not-sr-only">Skip to main content</a>`;
