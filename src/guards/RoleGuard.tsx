import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; roles: string[]; fallback?: string; }

export function RoleGuard({ children, roles, fallback = '/unauthorized' }: Props) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to={fallback} replace />;
  return <>{children}</>;
}