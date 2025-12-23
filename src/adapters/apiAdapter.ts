import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiAdapter {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export function createApiAdapter(instance: AxiosInstance): ApiAdapter {
  return {
    get: async <T>(url: string, config?: AxiosRequestConfig) => (await instance.get<T>(url, config)).data,
    post: async <T>(url: string, data?: any, config?: AxiosRequestConfig) => (await instance.post<T>(url, data, config)).data,
    put: async <T>(url: string, data?: any, config?: AxiosRequestConfig) => (await instance.put<T>(url, data, config)).data,
    delete: async <T>(url: string, config?: AxiosRequestConfig) => (await instance.delete<T>(url, config)).data,
  };
}
