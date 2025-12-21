import { useMemo } from 'react';
export function useRole(userRole: string, allowedRoles: string[]) {
  const hasAccess = useMemo(() => allowedRoles.includes(userRole), [userRole, allowedRoles]);
  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);
  return { hasAccess, isAdmin, role: userRole };
}