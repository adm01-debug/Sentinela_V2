import { useState, useCallback, useMemo } from "react";

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export function useRoles(userRoles: string[] = []) {
  const [roles, setRoles] = useState<Role[]>([]);

  const hasRole = useCallback((roleName: string) => {
    return userRoles.includes(roleName);
  }, [userRoles]);

  const hasPermission = useCallback((permission: string) => {
    return roles.some(r => userRoles.includes(r.name) && r.permissions.includes(permission));
  }, [roles, userRoles]);

  const addRole = useCallback((name: string, permissions: string[]) => {
    const role: Role = { id: crypto.randomUUID(), name, permissions };
    setRoles(prev => [...prev, role]);
    return role;
  }, []);

  return { roles, hasRole, hasPermission, addRole };
}
