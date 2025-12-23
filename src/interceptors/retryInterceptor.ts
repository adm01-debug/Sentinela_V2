import { AxiosInstance, AxiosError } from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const setupRetryInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as any;
    if (!config || !error.response) return Promise.reject(error);
    
    config.__retryCount = config.__retryCount || 0;
    
    if (config.__retryCount >= MAX_RETRIES) return Promise.reject(error);
    if (error.response.status < 500) return Promise.reject(error);
    
    config.__retryCount++;
    await new Promise(r => setTimeout(r, RETRY_DELAY * config.__retryCount));
    return instance(config);
  });
};
