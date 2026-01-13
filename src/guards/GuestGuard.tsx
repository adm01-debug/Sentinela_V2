import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export interface GuestGuardProps { children: React.ReactNode; redirectTo?: string; }
export const GuestGuard: React.FC<GuestGuardProps> = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};
export default GuestGuard;
