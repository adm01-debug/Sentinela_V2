import { useCallback } from 'react';
import { captureException } from '../lib/monitoring/sentry';

export function useErrorBoundary() {
  const handleError = useCallback((error: Error, info?: { componentStack: string }) => {
    captureException(error, { componentStack: info?.componentStack });
  }, []);
  
  return { handleError };
}
