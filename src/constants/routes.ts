// ============================================================
// ROUTES CONSTANTS - SENTINELA v20
// Rotas da aplicação centralizadas
// ============================================================

export const ROUTES = {
  // Auth routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Main routes
  DASHBOARD: '/dashboard',
  
  // Employee routes
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:id',
  EMPLOYEE_CREATE: '/employees/new',
  EMPLOYEE_EDIT: '/employees/:id/edit',
  
  // Activity routes
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
  
  // Monitoring routes
  SCREENSHOTS: '/screenshots',
  ALERTS: '/alerts',
  ALERT_DETAIL: '/alerts/:id',
  
  // Analytics routes
  ANALYTICS: '/analytics',
  ANALYTICS_PRODUCTIVITY: '/analytics/productivity',
  ANALYTICS_APPLICATIONS: '/analytics/applications',
  ANALYTICS_TRENDS: '/analytics/trends',
  
  // Reports routes
  REPORTS: '/reports',
  REPORT_DETAIL: '/reports/:id',
  REPORT_CREATE: '/reports/new',
  
  // Settings routes
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_API: '/settings/api',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_TELEMETRY: '/admin/telemetry',
  
  // Organization routes
  TEAMS: '/admin/teams',
  TEAM_DETAIL: '/admin/teams/:id',
  DEPARTMENTS: '/admin/departments',
  DEPARTMENT_DETAIL: '/admin/departments/:id',
  
  // Time & Projects routes
  TIME_CLOCK: '/time-clock',
  PROJECTS: '/projects',
  TIMESHEETS: '/timesheets',
  ATTENDANCE: '/attendance',
  HOURS_TRACKING: '/hours-tracking',

  // Other routes
  MAINTENANCE: '/maintenance',
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

// Helper function to generate dynamic routes
export const generateRoute = {
  employee: (id: string) => `/employees/${id}`,
  employeeEdit: (id: string) => `/employees/${id}/edit`,
  activity: (id: string) => `/activities/${id}`,
  alert: (id: string) => `/alerts/${id}`,
  report: (id: string) => `/reports/${id}`,
  team: (id: string) => `/teams/${id}`,
  department: (id: string) => `/departments/${id}`,
};

// Route groups for access control
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const;

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_ROLES,
  ROUTES.ADMIN_DEPARTMENTS,
  ROUTES.ADMIN_TEAMS,
  ROUTES.ADMIN_AUDIT,
] as const;

export const SETTINGS_ROUTES = [
  ROUTES.SETTINGS,
  ROUTES.SETTINGS_PROFILE,
  ROUTES.SETTINGS_SECURITY,
  ROUTES.SETTINGS_NOTIFICATIONS,
  ROUTES.SETTINGS_INTEGRATIONS,
  ROUTES.SETTINGS_BILLING,
  ROUTES.SETTINGS_API,
] as const;
