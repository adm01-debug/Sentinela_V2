import { useCallback } from 'react';

export function useErrorBoundary() {
  const handleError = useCallback((error: Error, info?: { componentStack: string }) => {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info?.componentStack);
    }
  }, []);
  
  return { handleError };
}
