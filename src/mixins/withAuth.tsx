import React, { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
interface WithAuthOptions { requiredRole?: string; redirectTo?: string; }
export function withAuth<P extends object>(Component: ComponentType<P>, options: WithAuthOptions = {}) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (!isAuthenticated) return <Navigate to={options.redirectTo || '/login'} replace />;
    if (options.requiredRole && user?.role !== options.requiredRole) return <Navigate to="/unauthorized" replace />;
    return <Component {...props} />;
  };
}
