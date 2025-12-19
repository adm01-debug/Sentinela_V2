import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

// ============================================================
// TYPES
// ============================================================

interface WindowSize {
  width: number;
  height: number;
}

interface UseWindowSizeOptions {
  debounceMs?: number;
  initialWidth?: number;
  initialHeight?: number;
}

// ============================================================
// useWindowSize - Track window dimensions
// ============================================================

/**
 * Hook to track window dimensions with optional debounce
 * @param options - Configuration options
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const {
    debounceMs = 100,
    initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200,
    initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800,
  } = options;

  const [size, setSize] = useState<WindowSize>({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    // Set initial size
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return size;
}

// ============================================================
// useWindowWidth - Only track width
// ============================================================

/**
 * Hook to track only window width
 */
export function useWindowWidth(debounceMs = 100): number {
  const { width } = useWindowSize({ debounceMs });
  return width;
}

// ============================================================
// useWindowHeight - Only track height
// ============================================================

/**
 * Hook to track only window height
 */
export function useWindowHeight(debounceMs = 100): number {
  const { height } = useWindowSize({ debounceMs });
  return height;
}

// ============================================================
// useAspectRatio - Get window aspect ratio
// ============================================================

/**
 * Returns the window aspect ratio (width / height)
 */
export function useAspectRatio(): number {
  const { width, height } = useWindowSize();
  return useMemo(() => {
    if (height === 0) return 1;
    return width / height;
  }, [width, height]);
}

// ============================================================
// useIsLandscape / useIsPortrait
// ============================================================

/**
 * Returns true if window is in landscape orientation
 */
export function useIsLandscape(): boolean {
  const { width, height } = useWindowSize();
  return width > height;
}

/**
 * Returns true if window is in portrait orientation
 */
export function useIsPortrait(): boolean {
  const { width, height } = useWindowSize();
  return height > width;
}

// ============================================================
// useWindowSizeClass - Get Tailwind-like size class
// ============================================================

type SizeClass = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Returns a Tailwind-like size class based on window width
 */
export function useWindowSizeClass(): SizeClass {
  const { width } = useWindowSize();

  return useMemo(() => {
    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 640) return 'sm';
    return 'xs';
  }, [width]);
}

// ============================================================
// useElementSize - Track element dimensions
// ============================================================

import { useRef, useCallback, RefObject } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

/**
 * Hook to track an element's dimensions using ResizeObserver
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T>,
  ElementSize
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, size];
}
