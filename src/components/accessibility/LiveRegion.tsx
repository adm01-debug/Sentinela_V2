import { useState, useEffect, memo, useCallback } from 'react';
import { VisuallyHidden } from './VisuallyHidden';

// ============================================================
// LIVE REGION COMPONENT
// Announces dynamic content changes to screen readers
// ============================================================

type Politeness = 'polite' | 'assertive' | 'off';

interface LiveRegionProps {
  'aria-live'?: Politeness;
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  clearOnUnmount?: boolean;
  role?: 'status' | 'alert' | 'log';
}

// Create a singleton for announcements
let announceCallback: ((message: string, politeness: Politeness) => void) | null = null;

export function announce(message: string, politeness: Politeness = 'polite') {
  announceCallback?.(message, politeness);
}

export const LiveRegion = memo(function LiveRegion({
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  'aria-relevant': ariaRelevant = 'additions text',
  clearOnUnmount = true,
  role = 'status',
}: LiveRegionProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const handleAnnounce = useCallback((message: string, politeness: Politeness) => {
    if (politeness === 'assertive') {
      setAssertiveMessage(message);
      // Clear after announcement
      setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      setPoliteMessage(message);
      // Clear after announcement
      setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  useEffect(() => {
    announceCallback = handleAnnounce;

    return () => {
      announceCallback = null;
      if (clearOnUnmount) {
        setPoliteMessage('');
        setAssertiveMessage('');
      }
    };
  }, [handleAnnounce, clearOnUnmount]);

  return (
    <>
      {/* Polite announcements */}
      <VisuallyHidden
        as="div"
        aria-live="polite"
        aria-atomic={ariaAtomic}
        aria-relevant={ariaRelevant}
        role={role}
      >
        {politeMessage}
      </VisuallyHidden>

      {/* Assertive announcements */}
      <VisuallyHidden
        as="div"
        aria-live="assertive"
        aria-atomic={ariaAtomic}
        aria-relevant={ariaRelevant}
        role="alert"
      >
        {assertiveMessage}
      </VisuallyHidden>
    </>
  );
});

// ============================================================
// HOOK FOR ANNOUNCEMENTS
// ============================================================

export function useAnnounce() {
  return useCallback((message: string, politeness: Politeness = 'polite') => {
    announce(message, politeness);
  }, []);
}

export default LiveRegion;
