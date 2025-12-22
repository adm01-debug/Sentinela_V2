import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; permission: string; fallback?: string; }

export function PermissionGuard({ children, permission, fallback = '/unauthorized' }: Props) {
  const { permissions } = useAuth();
  if (!permissions.includes(permission)) return <Navigate to={fallback} replace />;
  return <>{children}</>;
}