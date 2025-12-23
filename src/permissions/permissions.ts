export const Permissions = {
  USERS_READ: 'users:read', USERS_CREATE: 'users:create', USERS_UPDATE: 'users:update', USERS_DELETE: 'users:delete',
  EMPLOYEES_READ: 'employees:read', EMPLOYEES_CREATE: 'employees:create', EMPLOYEES_UPDATE: 'employees:update', EMPLOYEES_DELETE: 'employees:delete',
  TEAMS_READ: 'teams:read', TEAMS_CREATE: 'teams:create', TEAMS_UPDATE: 'teams:update', TEAMS_DELETE: 'teams:delete',
  REPORTS_READ: 'reports:read', REPORTS_CREATE: 'reports:create', REPORTS_EXPORT: 'reports:export',
  SETTINGS_READ: 'settings:read', SETTINGS_UPDATE: 'settings:update',
} as const;
export type Permission = typeof Permissions[keyof typeof Permissions];
