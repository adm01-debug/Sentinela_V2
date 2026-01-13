import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export interface RoleGuardProps { children: React.ReactNode; roles: string[]; fallback?: React.ReactNode; redirectTo?: string; }
export const RoleGuard: React.FC<RoleGuardProps> = ({ children, roles, fallback, redirectTo }) => {
  const { user } = useAuth();
  const hasRole = user?.role && roles.includes(user.role);
  if (!hasRole) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    if (fallback) return <>{fallback}</>;
    return <div style={{ padding: 40, textAlign: 'center' }}>Access Denied: Insufficient role</div>;
  }
  return <>{children}</>;
};
export default RoleGuard;
