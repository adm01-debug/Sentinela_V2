export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Sentinela',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  env: import.meta.env.VITE_APP_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
};
