export const EventTypes = {
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_EXPIRED: 'auth:token_expired',
  USER_UPDATED: 'user:updated',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  EMPLOYEE_CREATED: 'employee:created',
  EMPLOYEE_UPDATED: 'employee:updated',
  EMPLOYEE_DELETED: 'employee:deleted',
  ACTIVITY_DETECTED: 'activity:detected',
  VIOLATION_DETECTED: 'violation:detected',
  SCREENSHOT_CAPTURED: 'screenshot:captured',
  SYNC_START: 'sync:start',
  SYNC_COMPLETE: 'sync:complete',
  SYNC_ERROR: 'sync:error',
  THEME_CHANGED: 'theme:changed',
  LOCALE_CHANGED: 'locale:changed',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];
