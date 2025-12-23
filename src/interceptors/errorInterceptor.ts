import { AxiosInstance, AxiosError } from 'axios';
import { eventBus } from '@/events/eventBus';
import { EventTypes } from '@/events/eventTypes';

export function setupErrorInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        eventBus.emit(EventTypes.AUTH_TOKEN_EXPIRED);
        window.location.href = '/login';
      }
      if (error.response?.status === 403) {
        window.location.href = '/unauthorized';
      }
      if (error.response?.status >= 500) {
        eventBus.emit(EventTypes.ERROR_OCCURRED, { message: 'Erro no servidor' });
      }
      return Promise.reject(error);
    }
  );
}
