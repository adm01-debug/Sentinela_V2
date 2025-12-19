import { useRef, useEffect } from 'react';

// ============================================================
// usePrevious - Get previous value
// ============================================================

/**
 * Returns the previous value of a variable
 * @param value - Current value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================
// usePreviousDistinct - Only update when value actually changes
// ============================================================

/**
 * Returns the previous distinct value (ignores same value updates)
 * @param value - Current value
 * @param compare - Optional comparison function
 */
export function usePreviousDistinct<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean = Object.is
): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);
  const curRef = useRef<T>(value);

  if (!compare(curRef.current, value)) {
    prevRef.current = curRef.current;
    curRef.current = value;
  }

  return prevRef.current;
}

// ============================================================
// useHasChanged - Check if value changed
// ============================================================

/**
 * Returns true if the value has changed since last render
 * @param value - Value to check
 */
export function useHasChanged<T>(value: T): boolean {
  const prevValue = usePrevious(value);
  return prevValue !== value;
}

// ============================================================
// useChangedProps - Debug which props changed (dev only)
// ============================================================

/**
 * Logs which props changed between renders (for debugging)
 * Only active in development mode
 */
export function useChangedProps<T extends Record<string, unknown>>(
  props: T,
  componentName = 'Component'
): void {
  const prevProps = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (import.meta.env.DEV && prevProps.current) {
      const changedProps: string[] = [];

      Object.keys(props).forEach((key) => {
        if (prevProps.current![key] !== props[key]) {
          changedProps.push(key);
        }
      });

      if (changedProps.length > 0) {
        console.log(`[${componentName}] Changed props:`, changedProps);
      }
    }

    prevProps.current = props;
  });
}

// ============================================================
// useFirstRender - Check if first render
// ============================================================

/**
 * Returns true only on the first render
 */
export function useFirstRender(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}

// ============================================================
// useIsFirstRender - Alternative that updates after mount
// ============================================================

/**
 * Returns true during first render, then false
 */
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return isFirst.current;
}

// ============================================================
// useUpdateEffect - Effect that skips first render
// ============================================================

/**
 * Like useEffect but skips the first render
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
