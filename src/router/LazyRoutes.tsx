import { Suspense, lazy, ComponentType } from 'react';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export function lazyLoad<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  const LazyComponent = lazy(factory);
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export const LazyDashboard = lazyLoad(() => import('@/pages/Dashboard'));
export const LazyEmployees = lazyLoad(() => import('@/pages/Employees'));
export const LazyTeams = lazyLoad(() => import('@/pages/Teams'));
export const LazyReports = lazyLoad(() => import('@/pages/Reports'));
export const LazySettings = lazyLoad(() => import('@/pages/Settings'));
