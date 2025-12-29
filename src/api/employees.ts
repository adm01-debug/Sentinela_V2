import { api } from './client';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface EmployeeData {
  name: string;
  email: string;
  department?: string;
  role?: string;
  status?: 'active' | 'inactive';
  [key: string]: unknown;
}

interface ActivityParams {
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export const employeesApi = {
  list: (params?: ListParams) => api.get('/employees', { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: EmployeeData) => api.post('/employees', data),
  update: (id: string, data: Partial<EmployeeData>) => api.patch(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  activities: (id: string, params?: ActivityParams) => api.get(`/employees/${id}/activities`, { params }),
  screenshots: (id: string, params?: ActivityParams) => api.get(`/employees/${id}/screenshots`, { params }),
};

export type { ListParams, EmployeeData, ActivityParams };
