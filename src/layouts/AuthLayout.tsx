import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};
