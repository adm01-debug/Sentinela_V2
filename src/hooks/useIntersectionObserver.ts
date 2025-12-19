import { useState, useEffect, useRef, RefObject, useCallback } from 'react';

// ============================================================
// TYPES
// ============================================================

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  enabled?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: RefObject<any>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

// ============================================================
// useIntersectionObserver - Observe element visibility
// ============================================================

/**
 * Observe when an element enters/exits the viewport
 * @param options - IntersectionObserver options
 */
export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = useRef(false);

  const isIntersecting = entry?.isIntersecting ?? false;

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element || frozen.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (freezeOnceVisible && entry.isIntersecting) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, enabled]);

  return { ref, isIntersecting, entry };
}

// ============================================================
// useInView - Simplified version
// ============================================================

/**
 * Simple hook that returns true when element is in view
 */
export function useInView<T extends Element = Element>(
  options?: UseIntersectionObserverOptions
): [RefObject<T>, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver<T>(options);
  return [ref, isIntersecting];
}

// ============================================================
// useLazyLoad - For lazy loading content
// ============================================================

/**
 * Hook for lazy loading content when it enters the viewport
 * Returns true once the element has been visible (persists after scroll away)
 */
export function useLazyLoad<T extends Element = Element>(
  rootMargin = '100px'
): [RefObject<T>, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver<T>({
    rootMargin,
    freezeOnceVisible: true,
  });

  return [ref, isIntersecting];
}

// ============================================================
// useInfiniteScroll - For infinite scroll lists
// ============================================================

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Hook for implementing infinite scroll
 */
export function useInfiniteScroll<T extends Element = Element>(
  options: UseInfiniteScrollOptions
): RefObject<T> {
  const { hasMore, isLoading, onLoadMore, rootMargin = '200px', threshold = 0 } = options;

  const { ref, isIntersecting } = useIntersectionObserver<T>({
    rootMargin,
    threshold,
    enabled: hasMore && !isLoading,
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore]);

  return ref;
}

// ============================================================
// useVisibilityTracking - Track visibility percentage
// ============================================================

/**
 * Track how much of an element is visible
 */
export function useVisibilityTracking<T extends Element = Element>(): [
  RefObject<T>,
  number
] {
  const ref = useRef<T>(null);
  const [visibilityRatio, setVisibilityRatio] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibilityRatio(entry.intersectionRatio);
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, visibilityRatio];
}
