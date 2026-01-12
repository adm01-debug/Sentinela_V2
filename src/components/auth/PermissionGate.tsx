import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/constants/permissions';

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, permissions, requireAll = false, fallback = null, children }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasAccess = (() => {
    if (permission) return hasPermission(permission);
    if (permissions) return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    return true;
  })();

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
