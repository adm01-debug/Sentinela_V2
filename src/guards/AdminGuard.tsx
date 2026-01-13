import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export interface AdminGuardProps { children: React.ReactNode; redirectTo?: string; }
export const AdminGuard: React.FC<AdminGuardProps> = ({ children, redirectTo = '/dashboard' }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!user?.isAdmin && user?.role !== 'admin') return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};
export default AdminGuard;
