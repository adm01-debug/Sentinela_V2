import { AxiosInstance } from 'axios';

export const setupLoggingInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config) => {
    console.log('[API Request]', config.method?.toUpperCase(), config.url);
    return config;
  });

  instance.interceptors.response.use(
    (response) => { console.log('[API Response]', response.status, response.config.url); return response; },
    (error) => { console.error('[API Error]', error.response?.status, error.config?.url); return Promise.reject(error); }
  );
};
