import axios, { AxiosInstance } from 'axios';
import { setupAuthInterceptor } from '@/interceptors/authInterceptor';
import { setupErrorInterceptor } from '@/interceptors/errorInterceptor';
import { setupRetryInterceptor } from '@/interceptors/retryInterceptor';
const api: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 30000, headers: { 'Content-Type': 'application/json' } });
setupAuthInterceptor(api);
setupErrorInterceptor(api);
setupRetryInterceptor(api);
export { api };
