import { apiClient } from '@/lib/api';
import type { Employee, EmployeeFilters, EmployeeCreateInput, EmployeeUpdateInput, EmployeeProductivity } from '@/types';
import type { PaginatedResponse } from '@/types/pagination';

export const employeeService = {
  async list(filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    return apiClient.get('/employees', filters as Record<string, string>);
  },
  async get(id: string): Promise<Employee> {
    return apiClient.get('/employees/' + id);
  },
  async create(data: EmployeeCreateInput): Promise<Employee> {
    return apiClient.post('/employees', data);
  },
  async update(id: string, data: EmployeeUpdateInput): Promise<Employee> {
    return apiClient.put('/employees/' + id, data);
  },
  async delete(id: string): Promise<void> {
    return apiClient.delete('/employees/' + id);
  },
  async getStats(id: string, startDate: string, endDate: string): Promise<EmployeeProductivity> {
    return apiClient.get('/employees/' + id + '/stats', { startDate, endDate });
  },
  async bulkUpdate(ids: string[], data: EmployeeUpdateInput): Promise<Employee[]> {
    return apiClient.post('/employees/bulk-update', { ids, data });
  },
  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post('/employees/bulk-delete', { ids });
  },
  async export(filters?: EmployeeFilters): Promise<Blob> {
    return apiClient.get('/employees/export', filters as Record<string, string>);
  }
};
