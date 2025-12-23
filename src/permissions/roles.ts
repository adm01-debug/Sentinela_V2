export const Roles = { SUPER_ADMIN: 'super_admin', ADMIN: 'admin', MANAGER: 'manager', SUPERVISOR: 'supervisor', EMPLOYEE: 'employee', VIEWER: 'viewer' } as const;
export type Role = typeof Roles[keyof typeof Roles];
export const RoleHierarchy: Record<Role, number> = { super_admin: 100, admin: 80, manager: 60, supervisor: 40, employee: 20, viewer: 10 };
export function hasHigherRole(userRole: Role, requiredRole: Role): boolean { return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole]; }
