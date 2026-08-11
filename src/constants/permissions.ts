export const PERMISSIONS = {
  // Employees
  EMPLOYEES_VIEW: 'employees:view',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_EDIT: 'employees:edit',
  EMPLOYEES_DELETE: 'employees:delete',
  // Screenshots
  SCREENSHOTS_VIEW: 'screenshots:view',
  SCREENSHOTS_DELETE: 'screenshots:delete',
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  // Admin
  ADMIN_ACCESS: 'admin:access',
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_BILLING: 'admin:billing',
  ADMIN_INTEGRATIONS: 'admin:integrations',
} as const;

export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  manager: [PERMISSIONS.EMPLOYEES_VIEW, PERMISSIONS.EMPLOYEES_EDIT, PERMISSIONS.SCREENSHOTS_VIEW, PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT],
  viewer: [PERMISSIONS.EMPLOYEES_VIEW, PERMISSIONS.SCREENSHOTS_VIEW, PERMISSIONS.REPORTS_VIEW],
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Role = keyof typeof ROLE_PERMISSIONS;
