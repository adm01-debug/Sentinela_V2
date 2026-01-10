import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 24,
}) => (
  <div role="status" aria-label={label} className="flex items-center gap-2">
    <Loader2 size={size} className="animate-spin" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </div>
);

export default LoadingSpinner;
