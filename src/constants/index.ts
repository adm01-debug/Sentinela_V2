export const APP_NAME = 'Sentinela';
export const APP_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  AUTH: '/auth',
  EMPLOYEES: '/employees',
  ACTIVITIES: '/activities',
  ALERTS: '/alerts',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  SCREENSHOTS: '/screenshots',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:id',
  ACTIVITIES: '/activities',
  REPORTS: '/reports',
  ALERTS: '/alerts',
  SETTINGS: '/settings',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

export const DATE_FORMATS = {
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm',
  DISPLAY: 'MMM dd, yyyy',
  RELATIVE: 'relative',
};

export const SEVERITY_COLORS = {
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

export const STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  suspended: 'red',
};