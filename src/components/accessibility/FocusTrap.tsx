import { useEffect, useRef, ReactNode, memo } from 'react';

// ============================================================
// FOCUS TRAP COMPONENT
// Traps focus within a container for modals/dialogs
// ============================================================

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  returnFocusOnDeactivate?: boolean;
  initialFocus?: string;
}

export const FocusTrap = memo(function FocusTrap({
  children,
  active = true,
  returnFocusOnDeactivate = true,
  initialFocus,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement;

    // Get focusable elements
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
      );
    };

    // Focus initial element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      if (initialFocus) {
        const initialElement = containerRef.current?.querySelector<HTMLElement>(initialFocus);
        initialElement?.focus();
      } else {
        focusableElements[0]?.focus();
      }
    }

    // Handle keydown for tab trapping
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } 
      // Tab
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to previously focused element
      if (returnFocusOnDeactivate && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, initialFocus, returnFocusOnDeactivate]);

  return (
    <div ref={containerRef} data-focus-trap={active}>
      {children}
    </div>
  );
});

export default FocusTrap;
