import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export interface AuthGuardProps { children: React.ReactNode; redirectTo?: string; }
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  return <>{children}</>;
};
export default AuthGuard;
