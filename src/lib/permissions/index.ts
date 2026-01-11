export type Permission = 'read' | 'write' | 'delete' | 'admin' | '*';
export type Resource = 'employees' | 'activities' | 'reports' | 'alerts' | 'settings' | 'users';
export type Role = 'admin' | 'manager' | 'analyst' | 'viewer';
const rolePermissions: Record<Role, Record<Resource, Permission[]>> = {
  admin: { employees: ['*'], activities: ['*'], reports: ['*'], alerts: ['*'], settings: ['*'], users: ['*'] },
  manager: { employees: ['read', 'write'], activities: ['read'], reports: ['read', 'write'], alerts: ['read', 'write'], settings: ['read'], users: ['read'] },
  analyst: { employees: ['read'], activities: ['read'], reports: ['read', 'write'], alerts: ['read'], settings: ['read'], users: ['read'] },
  viewer: { employees: ['read'], activities: ['read'], reports: ['read'], alerts: ['read'], settings: [], users: [] },
};
export const hasPermission = (role: Role, resource: Resource, permission: Permission): boolean => {
  const perms = rolePermissions[role]?.[resource] || [];
  return perms.includes('*') || perms.includes(permission);
};
export const getPermissions = (role: Role): Record<Resource, Permission[]> => rolePermissions[role] || {};
