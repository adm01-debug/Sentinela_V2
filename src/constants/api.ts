export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  EMPLOYEES: "/employees",
  SCREENSHOTS: "/screenshots",
  ANALYTICS: "/analytics",
  REPORTS: "/reports",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  BILLING: "/billing",
  WEBHOOKS: "/webhooks",
  API_KEYS: "/api-keys",
  AUDIT: "/audit",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
