import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { cacheManager } from '@/cache/cacheManager';

export function setupCacheInterceptor(api: AxiosInstance, ttlMs: number = 60000) {
  api.interceptors.request.use((config: AxiosRequestConfig) => {
    if (config.method === 'get') {
      const cacheKey = config.url + JSON.stringify(config.params || {});
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        (config as any)._fromCache = true;
        (config as any)._cachedData = cached;
      }
    }
    return config;
  });

  api.interceptors.response.use(response => {
    if (response.config.method === 'get' && !(response.config as any)._fromCache) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      cacheManager.set(cacheKey, response.data, ttlMs);
    }
    return response;
  });
}
