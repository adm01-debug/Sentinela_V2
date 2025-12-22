import { ComponentType, Suspense } from 'react';

export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback: React.ReactNode = <div>Loading...</div>
) {
  return function SuspenseComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
