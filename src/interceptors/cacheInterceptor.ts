import { AxiosInstance } from 'axios';
import { cacheManager } from '@/cache/cacheManager';

export const setupCacheInterceptor = (instance: AxiosInstance, ttlMs = 5 * 60 * 1000) => {
  instance.interceptors.request.use((config) => {
    if (config.method === 'get') {
      const key = config.url + JSON.stringify(config.params || {});
      const cached = cacheManager.get(key);
      if (cached) {
        config.adapter = () => Promise.resolve({ data: cached, status: 200, statusText: 'OK', headers: {}, config });
      }
    }
    return config;
  });

  instance.interceptors.response.use((response) => {
    if (response.config.method === 'get') {
      const key = response.config.url + JSON.stringify(response.config.params || {});
      cacheManager.set(key, response.data, ttlMs);
    }
    return response;
  });
};
