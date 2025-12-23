import { lazy } from 'react';

export const LazyRoutes = {
  Login: lazy(() => import('@/pages/Login')),
  Register: lazy(() => import('@/pages/Register')),
  ForgotPassword: lazy(() => import('@/pages/ForgotPassword')),
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  Employees: lazy(() => import('@/pages/Employees')),
  Teams: lazy(() => import('@/pages/Teams')),
  Activities: lazy(() => import('@/pages/Activities')),
  Screenshots: lazy(() => import('@/pages/Screenshots')),
  Reports: lazy(() => import('@/pages/Reports')),
  Settings: lazy(() => import('@/pages/Settings')),
  Profile: lazy(() => import('@/pages/Profile')),
  NotFound: lazy(() => import('@/pages/NotFound')),
};
