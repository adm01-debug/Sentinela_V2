import { api } from '@/plugins/axios';
export class HttpGateway {
  async get<T>(url: string, params?: any): Promise<T> { const { data } = await api.get(url, { params }); return data; }
  async post<T>(url: string, body: any): Promise<T> { const { data } = await api.post(url, body); return data; }
  async put<T>(url: string, body: any): Promise<T> { const { data } = await api.put(url, body); return data; }
  async delete<T>(url: string): Promise<T> { const { data } = await api.delete(url); return data; }
  async patch<T>(url: string, body: any): Promise<T> { const { data } = await api.patch(url, body); return data; }
}
export const httpGateway = new HttpGateway();
