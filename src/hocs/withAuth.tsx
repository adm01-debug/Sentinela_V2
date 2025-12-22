import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuth(props: P) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to='/login' replace />;
    return <Component {...props} />;
  };
}