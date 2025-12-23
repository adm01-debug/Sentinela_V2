export const EventTypes = {
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_EXPIRED: 'auth:token_expired',
  USER_UPDATED: 'user:updated',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  THEME_CHANGED: 'theme:changed',
  LOCALE_CHANGED: 'locale:changed',
  SCREENSHOT_CAPTURED: 'screenshot:captured',
  ACTIVITY_STARTED: 'activity:started',
  ACTIVITY_ENDED: 'activity:ended',
  VIOLATION_DETECTED: 'violation:detected',
  SYNC_STARTED: 'sync:started',
  SYNC_COMPLETED: 'sync:completed',
  SYNC_FAILED: 'sync:failed',
  ERROR_OCCURRED: 'error:occurred',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];
