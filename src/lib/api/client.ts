import { ApiError } from '@/utils/api';
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
type RequestOptions = RequestInit & { params?: Record<string, string> };
class ApiClient {
  private token: string | null = null;
  setToken(token: string | null) { this.token = token; }
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    return headers;
  }
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    let url = BASE_URL + endpoint;
    if (params) url += '?' + new URLSearchParams(params).toString();
    const response = await fetch(url, { ...init, headers: { ...this.getHeaders(), ...init.headers } });
    if (!response.ok) throw new ApiError(response.status, response.statusText);
    return response.json();
  }
  get<T>(endpoint: string, params?: Record<string, string>) { return this.request<T>(endpoint, { method: 'GET', params }); }
  post<T>(endpoint: string, data?: unknown) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  put<T>(endpoint: string, data?: unknown) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  patch<T>(endpoint: string, data?: unknown) { return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}
export const apiClient = new ApiClient();
