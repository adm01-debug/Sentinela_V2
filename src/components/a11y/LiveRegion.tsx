import { memo, useState, useEffect } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

/**
 * Announces dynamic content changes to screen readers
 */
function LiveRegionComponent({ 
  message, 
  politeness = 'polite',
  clearAfter = 5000 
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
    
    if (clearAfter > 0) {
      const timer = setTimeout(() => setAnnouncement(''), clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

export const LiveRegion = memo(LiveRegionComponent);

/**
 * Alert variant of LiveRegion for urgent messages
 */
export function AlertRegion({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="assertive" className="sr-only">
      {message}
    </div>
  );
}
