import { useState, useCallback, useMemo } from 'react';

// ============================================================
// useToggle - Boolean state toggle
// ============================================================

/**
 * Toggle a boolean state
 * @param initialValue - Initial boolean value (default: false)
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setValueDirectly = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setValueDirectly];
}

// ============================================================
// useBoolean - Extended boolean state management
// ============================================================

interface UseBooleanReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

/**
 * Extended boolean state with named setters
 */
export function useBoolean(initialValue = false): UseBooleanReturn {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return useMemo(
    () => ({ value, toggle, setTrue, setFalse, setValue }),
    [value, toggle, setTrue, setFalse]
  );
}

// ============================================================
// useDisclosure - For modals, dropdowns, etc.
// ============================================================

interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * Manage open/close state for modals, dialogs, etc.
 */
export function useDisclosure(initialOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const onOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

  return useMemo(
    () => ({ isOpen, open, close, toggle, onOpenChange }),
    [isOpen, open, close, toggle, onOpenChange]
  );
}

// ============================================================
// useMultipleDisclosure - Manage multiple disclosures
// ============================================================

interface UseMultipleDisclosureReturn<T extends string> {
  openItems: Set<T>;
  isOpen: (item: T) => boolean;
  open: (item: T) => void;
  close: (item: T) => void;
  toggle: (item: T) => void;
  closeAll: () => void;
  openAll: (items: T[]) => void;
}

/**
 * Manage multiple open/close states (e.g., accordion)
 */
export function useMultipleDisclosure<T extends string>(
  initialOpen: T[] = []
): UseMultipleDisclosureReturn<T> {
  const [openItems, setOpenItems] = useState<Set<T>>(new Set(initialOpen));

  const isOpen = useCallback((item: T) => openItems.has(item), [openItems]);

  const open = useCallback((item: T) => {
    setOpenItems((prev) => new Set(prev).add(item));
  }, []);

  const close = useCallback((item: T) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const toggle = useCallback((item: T) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setOpenItems(new Set());
  }, []);

  const openAll = useCallback((items: T[]) => {
    setOpenItems(new Set(items));
  }, []);

  return useMemo(
    () => ({ openItems, isOpen, open, close, toggle, closeAll, openAll }),
    [openItems, isOpen, open, close, toggle, closeAll, openAll]
  );
}

// ============================================================
// useCycle - Cycle through values
// ============================================================

/**
 * Cycle through a list of values
 */
export function useCycle<T>(values: T[]): [T, () => void, (index: number) => void] {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % values.length);
  }, [values.length]);

  const setValueByIndex = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < values.length) {
        setIndex(newIndex);
      }
    },
    [values.length]
  );

  return [values[index], next, setValueByIndex];
}
