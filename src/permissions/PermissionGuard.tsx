import React from 'react';
import { usePermission } from './usePermission';
import { Permission } from './permissions';
interface Props { permission: Permission | Permission[]; children: React.ReactNode; fallback?: React.ReactNode; requireAll?: boolean; }
export function PermissionGuard({ permission, children, fallback = null, requireAll = false }: Props) {
  const ability = usePermission();
  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll ? ability.canAll(permissions) : ability.canAny(permissions);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
