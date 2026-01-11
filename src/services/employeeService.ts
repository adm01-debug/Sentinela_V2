import { apiClient } from '@/lib/api';
import type { Employee, EmployeeStats, EmployeeFilters, CreateEmployeeInput, UpdateEmployeeInput, PaginatedResponse } from '@/types';

export const employeeService = {
  async list(filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    return apiClient.get('/employees', filters as Record<string, string>);
  },
  async get(id: string): Promise<Employee> {
    return apiClient.get('/employees/' + id);
  },
  async create(data: CreateEmployeeInput): Promise<Employee> {
    return apiClient.post('/employees', data);
  },
  async update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    return apiClient.put('/employees/' + id, data);
  },
  async delete(id: string): Promise<void> {
    return apiClient.delete('/employees/' + id);
  },
  async getStats(id: string, startDate: string, endDate: string): Promise<EmployeeStats> {
    return apiClient.get('/employees/' + id + '/stats', { startDate, endDate });
  },
  async bulkUpdate(ids: string[], data: UpdateEmployeeInput): Promise<Employee[]> {
    return apiClient.post('/employees/bulk-update', { ids, data });
  },
  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post('/employees/bulk-delete', { ids });
  },
  async export(filters?: EmployeeFilters): Promise<Blob> {
    return apiClient.get('/employees/export', filters as Record<string, string>);
  }
};