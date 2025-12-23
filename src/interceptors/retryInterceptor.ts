import { AxiosInstance, AxiosError } from 'axios';

interface RetryConfig { retries: number; delay: number; }

export function setupRetryInterceptor(api: AxiosInstance, config: RetryConfig = { retries: 3, delay: 1000 }) {
  api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const cfg = error.config as any;
      if (!cfg || !cfg._retryCount) cfg._retryCount = 0;
      
      if (cfg._retryCount < config.retries && error.response?.status >= 500) {
        cfg._retryCount++;
        await new Promise(r => setTimeout(r, config.delay * cfg._retryCount));
        return api(cfg);
      }
      return Promise.reject(error);
    }
  );
}
