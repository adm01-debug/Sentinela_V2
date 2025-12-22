export const API = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    EMPLOYEES: '/employees',
    TEAMS: '/teams',
    ACTIVITIES: '/activities',
    SCREENSHOTS: '/screenshots',
    VIOLATIONS: '/violations',
    REPORTS: '/reports',
  },
};
