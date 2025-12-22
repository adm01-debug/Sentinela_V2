import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function withPermission<P extends object>(Component: ComponentType<P>, permissions: string[]) {
  return function PermissionComponent(props: P) {
    const { user } = useAuth();
    const hasPermission = permissions.every(p => user?.permissions?.includes(p));

    if (!hasPermission) return <Navigate to="/unauthorized" replace />;
    return <Component {...props} />;
  };
}
