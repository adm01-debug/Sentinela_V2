import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface PublicRouteProps { children: React.ReactNode; redirectTo?: string; }

export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
