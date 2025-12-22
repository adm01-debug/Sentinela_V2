import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to='/unauthorized' replace />;
  return <>{children}</>;
}