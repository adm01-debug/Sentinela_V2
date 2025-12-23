import { AxiosInstance } from 'axios';

export function setupLoggingInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(config => {
    if (import.meta.env.DEV) {
      console.log('[API Request]', config.method?.toUpperCase(), config.url);
    }
    return config;
  });

  api.interceptors.response.use(
    response => {
      if (import.meta.env.DEV) {
        console.log('[API Response]', response.status, response.config.url);
      }
      return response;
    },
    error => {
      if (import.meta.env.DEV) {
        console.error('[API Error]', error.response?.status, error.config?.url);
      }
      return Promise.reject(error);
    }
  );
}
