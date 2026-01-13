import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
export interface PermissionGuardProps { children: React.ReactNode; permissions: string[]; mode?: 'all' | 'any'; fallback?: React.ReactNode; }
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ children, permissions, mode = 'all', fallback }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const hasAccess = mode === 'all' ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  if (!hasAccess) return fallback ? <>{fallback}</> : null;
  return <>{children}</>;
};
export default PermissionGuard;
