export const API = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};