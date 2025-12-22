import { ComponentType, Suspense } from 'react';

export function withSuspense<P extends object>(Component: ComponentType<P>, fallback: React.ReactNode) {
  return function WithSuspense(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}