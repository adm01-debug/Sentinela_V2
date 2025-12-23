import { AxiosInstance, AxiosError } from 'axios';
import { eventBus } from '@/events/eventBus';
import { EventTypes } from '@/events/eventTypes';

export const setupErrorInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        eventBus.emit(EventTypes.AUTH_TOKEN_EXPIRED);
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );
};
