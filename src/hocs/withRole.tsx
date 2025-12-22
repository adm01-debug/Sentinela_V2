import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function withRole<P extends object>(Component: ComponentType<P>, roles: string[]) {
  return function RoleComponent(props: P) {
    const { user } = useAuth();

    if (!user || !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
    return <Component {...props} />;
  };
}
