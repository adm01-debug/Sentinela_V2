import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

export function PublicRoute({ children }: { children?: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (user) return <Navigate to="/" replace />;

  return children || <Outlet />;
}
