import { useEffect, useCallback, useRef } from 'react';

// ============================================================
// TYPES
// ============================================================

type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta';

interface ShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: HTMLElement | Document | Window | null;
}

interface ShortcutDefinition {
  key: string;
  modifiers?: KeyModifier[];
  handler: (event: KeyboardEvent) => void;
  options?: ShortcutOptions;
}

// ============================================================
// useKeyboardShortcut - Single shortcut
// ============================================================

/**
 * Register a single keyboard shortcut
 * @param key - The key to listen for (e.g., 'k', 'Enter', 'Escape')
 * @param handler - Function to call when shortcut is triggered
 * @param modifiers - Array of modifier keys required
 * @param options - Additional options
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  modifiers: KeyModifier[] = [],
  options: ShortcutOptions = {}
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    target = typeof document !== 'undefined' ? document : null,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || !target) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      // Check modifiers
      const ctrlRequired = modifiers.includes('ctrl');
      const altRequired = modifiers.includes('alt');
      const shiftRequired = modifiers.includes('shift');
      const metaRequired = modifiers.includes('meta');

      const modifiersMatch =
        event.ctrlKey === ctrlRequired &&
        event.altKey === altRequired &&
        event.shiftKey === shiftRequired &&
        event.metaKey === metaRequired;

      if (keyMatches && modifiersMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        handlerRef.current(event);
      }
    };

    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [key, modifiers, enabled, preventDefault, stopPropagation, target]);
}

// ============================================================
// useKeyboardShortcuts - Multiple shortcuts
// ============================================================

/**
 * Register multiple keyboard shortcuts at once
 * @param shortcuts - Array of shortcut definitions
 */
export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]): void {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        const { key, modifiers = [], handler, options = {} } = shortcut;
        const { enabled = true, preventDefault = true, stopPropagation = false } = options;

        if (!enabled) continue;

        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        const ctrlRequired = modifiers.includes('ctrl');
        const altRequired = modifiers.includes('alt');
        const shiftRequired = modifiers.includes('shift');
        const metaRequired = modifiers.includes('meta');

        const modifiersMatch =
          event.ctrlKey === ctrlRequired &&
          event.altKey === altRequired &&
          event.shiftKey === shiftRequired &&
          event.metaKey === metaRequired;

        if (keyMatches && modifiersMatch) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          handler(event);
          break; // Only trigger first matching shortcut
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

// ============================================================
// useEscapeKey - Convenience hook for Escape key
// ============================================================

/**
 * Register handler for Escape key
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  useKeyboardShortcut('Escape', handler, [], { enabled });
}

// ============================================================
// useEnterKey - Convenience hook for Enter key
// ============================================================

/**
 * Register handler for Enter key
 */
export function useEnterKey(handler: () => void, enabled = true): void {
  useKeyboardShortcut('Enter', handler, [], { enabled, preventDefault: false });
}

// ============================================================
// Common shortcut patterns
// ============================================================

/**
 * Ctrl/Cmd + S (Save)
 */
export function useSaveShortcut(handler: () => void, enabled = true): void {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  useKeyboardShortcut('s', handler, [isMac ? 'meta' : 'ctrl'], { enabled });
}

/**
 * Ctrl/Cmd + K (Command palette)
 */
export function useCommandPaletteShortcut(handler: () => void, enabled = true): void {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  useKeyboardShortcut('k', handler, [isMac ? 'meta' : 'ctrl'], { enabled });
}

/**
 * Ctrl/Cmd + / (Help)
 */
export function useHelpShortcut(handler: () => void, enabled = true): void {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  useKeyboardShortcut('/', handler, [isMac ? 'meta' : 'ctrl'], { enabled });
}
