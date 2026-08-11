import { useEffect, useRef, RefObject } from 'react';

// ============================================================
// useOnClickOutside - Detect clicks outside an element
// ============================================================

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Calls handler when clicking outside the referenced element
 * @param ref - Ref to the element to detect clicks outside of
 * @param handler - Function to call when clicking outside
 * @param enabled - Whether the listener is enabled (default: true)
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

// ============================================================
// useOnClickOutsideMultiple - Multiple refs version
// ============================================================

/**
 * Calls handler when clicking outside any of the referenced elements
 * Useful for dropdowns with portaled content
 */
export function useOnClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: Handler,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the refs
      const isInside = refs.some((ref) => {
        const el = ref?.current;
        return el && el.contains(event.target as Node);
      });

      if (!isInside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler, enabled]);
}

// ============================================================
// useClickOutsideRef - Returns a ref with click outside detection
// ============================================================

/**
 * Returns a ref that triggers handler when clicking outside
 * More convenient when you don't have an existing ref
 */
export function useClickOutsideRef<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  enabled = true
): RefObject<T> {
  const ref = useRef<T>(null);
  useOnClickOutside(ref, handler, enabled);
  return ref;
}
