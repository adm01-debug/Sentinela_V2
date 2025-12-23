import { Role } from './roles';
import { Permission, Permissions } from './permissions';
const P = Permissions;
export const RolePermissions: Record<Role, Permission[]> = {
  super_admin: Object.values(P),
  admin: [P.USERS_READ, P.USERS_CREATE, P.USERS_UPDATE, P.EMPLOYEES_READ, P.EMPLOYEES_CREATE, P.EMPLOYEES_UPDATE, P.EMPLOYEES_DELETE, P.TEAMS_READ, P.TEAMS_CREATE, P.TEAMS_UPDATE, P.TEAMS_DELETE, P.REPORTS_READ, P.REPORTS_CREATE, P.REPORTS_EXPORT, P.SETTINGS_READ, P.SETTINGS_UPDATE],
  manager: [P.EMPLOYEES_READ, P.EMPLOYEES_CREATE, P.EMPLOYEES_UPDATE, P.TEAMS_READ, P.TEAMS_UPDATE, P.REPORTS_READ, P.REPORTS_CREATE, P.REPORTS_EXPORT],
  supervisor: [P.EMPLOYEES_READ, P.TEAMS_READ, P.REPORTS_READ, P.REPORTS_CREATE],
  employee: [P.REPORTS_READ],
  viewer: [P.REPORTS_READ],
};
export function hasPermission(role: Role, permission: Permission): boolean { return RolePermissions[role]?.includes(permission) ?? false; }
