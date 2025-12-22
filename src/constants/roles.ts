export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.SUPERVISOR]: 40,
  [ROLES.EMPLOYEE]: 20,
  [ROLES.VIEWER]: 10,
};
