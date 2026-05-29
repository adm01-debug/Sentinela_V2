import { createContext, useContext, ReactNode } from 'react';
import { Role, Resource, Permission, hasPermission, getPermissions } from './index';
interface PermissionsContextType { 
  role: Role; 
  can: (resource: Resource, permission: Permission) => boolean; 
  permissions: Partial<Record<Resource, Permission[]>>; 
}
const PermissionsContext = createContext<PermissionsContextType | null>(null);
export const PermissionsProvider = ({ role, children }: { role: Role | string; children: ReactNode }) => {
  const normalizedRole = (role as Role) || 'viewer';
  const can = (resource: Resource, permission: Permission) => hasPermission(normalizedRole, resource, permission);
  const permissions = getPermissions(normalizedRole);
  return <PermissionsContext.Provider value={{ role: normalizedRole, can, permissions }}>{children}</PermissionsContext.Provider>;
};
export const usePermissions = () => { const ctx = useContext(PermissionsContext); if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider'); return ctx; };
export const useCan = (resource: Resource, permission: Permission) => { const { can } = usePermissions(); return can(resource, permission); };
