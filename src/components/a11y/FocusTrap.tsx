import React, { useRef, useEffect, useCallback, memo } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: boolean;
  onEscape?: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

function FocusTrapComponent({
  children,
  active = true,
  initialFocus,
  returnFocus = true,
  onEscape,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
  }, []);

  // Handle focus on mount
  useEffect(() => {
    if (!active) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable
    const focusInitial = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    requestAnimationFrame(focusInitial);

    return () => {
      // Return focus on unmount
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus, getFocusableElements]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!active) return;

      // Handle Escape
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab
      if (event.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          // Shift+Tab: Move backwards
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: Move forwards
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [active, getFocusableElements, onEscape]
  );

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

export const FocusTrap = memo(FocusTrapComponent);

// Custom hook for focus management
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active = true) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [containerRef, active]);
}

export default FocusTrap;
