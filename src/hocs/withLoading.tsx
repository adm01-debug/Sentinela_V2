import { ComponentType, Suspense } from 'react';
import { Loading } from '@/components/ui/loading';

export function withLoading<P extends object>(Component: ComponentType<P>, fallback?: React.ReactNode) {
  return function WithLoading(props: P) {
    return (
      <Suspense fallback={fallback || <Loading />}>
        <Component {...props} />
      </Suspense>
    );
  };
}