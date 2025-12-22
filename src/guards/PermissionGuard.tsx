import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; permissions: string[]; }

export function PermissionGuard({ children, permissions }: Props) {
  const { user } = useAuth();

  const hasPermission = permissions.every(p => user?.permissions?.includes(p));
  if (!hasPermission) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
