import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; roles: string[]; }

export function RoleGuard({ children, roles }: Props) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
