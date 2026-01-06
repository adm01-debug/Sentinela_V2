import * as React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  clearAfter?: number;
  className?: string;
}

export function LiveRegion({
  message,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  clearAfter,
  className,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clearAfter && message && regionRef.current) {
      const timer = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  );
}

// Hook for programmatic announcements
export function useAnnounce() {
  const [message, setMessage] = React.useState('');
  
  const announce = React.useCallback((text: string, delay = 0) => {
    if (delay > 0) {
      setTimeout(() => setMessage(text), delay);
    } else {
      setMessage(text);
    }
  }, []);

  const clear = React.useCallback(() => setMessage(''), []);

  return { message, announce, clear };
}

export default LiveRegion;
