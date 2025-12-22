import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; }

export function AdminGuard({ children }: Props) {
  const { user } = useAuth();

  if (user?.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
