export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retryCount: Number(import.meta.env.VITE_API_RETRY) || 3,
  retryDelay: 1000,
};
