import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiAdapter {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
  put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export function createApiAdapter(instance: AxiosInstance): ApiAdapter {
  return {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await instance.get(url, config);
      return response.data;
    },
    post: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await instance.post(url, data, config);
      return response.data;
    },
    put: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await instance.put(url, data, config);
      return response.data;
    },
    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await instance.delete(url, config);
      return response.data;
    },
  };
}
