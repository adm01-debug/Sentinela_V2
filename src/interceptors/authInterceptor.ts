import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const setupAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = 'Bearer ' + token;
    return config;
  });
};
