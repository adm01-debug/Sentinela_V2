import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
};

export const AppRoutes = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
    </Route>
    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
      <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
      <Route path={ROUTES.EMPLOYEE_DETAIL} element={<EmployeeDetailPage />} />
      <Route path={ROUTES.ACTIVITIES} element={<ActivitiesPage />} />
      <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
      <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);