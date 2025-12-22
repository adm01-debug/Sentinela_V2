import { ComponentType, Suspense } from 'react';

interface LoadingProps { fallback?: React.ReactNode; }

export function withLoading<P extends object>(
  Component: ComponentType<P>,
  { fallback = <div>Loading...</div> }: LoadingProps = {}
) {
  return function LoadingComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
