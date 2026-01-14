import React from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ message, politeness = 'polite' }) => (
  <div
    role="status"
    aria-live={politeness}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// Alias for AlertRegion (assertive by default)
interface AlertRegionProps {
  message: string;
}

export const AlertRegion: React.FC<AlertRegionProps> = ({ message }) => (
  <LiveRegion message={message} politeness="assertive" />
);

export default LiveRegion;
