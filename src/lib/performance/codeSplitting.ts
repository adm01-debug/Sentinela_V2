// Route-based code splitting configuration
import { lazy, Suspense } from 'react';

// Lazy load heavy routes
export const lazyRoutes = {
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  Reports: lazy(() => import('@/pages/Reports')),
  Analytics: lazy(() => import('@/pages/Analytics')),
  Settings: lazy(() => import('@/pages/Settings')),
  Employees: lazy(() => import('@/pages/Employees')),
};

// Suspense wrapper
export const withSuspense = (Component: React.LazyExoticComponent<any>, fallback = null) => (
  <Suspense fallback={fallback}><Component /></Suspense>
);
