import { lazy, Suspense } from 'react';

export const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Retry once
      return await componentImport();
    }
  });

export const withSuspense = (Component: React.ComponentType, fallback = null) => (
  <Suspense fallback={fallback}><Component /></Suspense>
);
