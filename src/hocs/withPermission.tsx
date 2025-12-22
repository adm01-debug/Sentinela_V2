import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function withPermission<P extends object>(Component: ComponentType<P>, permission: string) {
  return function WithPermission(props: P) {
    const { permissions } = useAuth();
    if (!permissions.includes(permission)) return <Navigate to='/unauthorized' replace />;
    return <Component {...props} />;
  };
}