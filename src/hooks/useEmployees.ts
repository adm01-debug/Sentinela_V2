import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services';
import type { EmployeeFilters, EmployeeCreateInput, EmployeeUpdateInput } from '@/types';

// Extended type with device info
export interface EmployeeDevice {
  id: string;
  device_name: string;
  device_type: string;
  is_primary: boolean;
}

export interface EmployeeWithDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  team_id: string | null;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  hire_date?: string | null;
  notes?: string | null;
  devices?: EmployeeDevice[];
}

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({ queryKey: ['employees', filters], queryFn: () => employeeService.list(filters) });
};

export const useEmployee = (id: string) => {
  return useQuery({ queryKey: ['employee', id], queryFn: () => employeeService.get(id), enabled: !!id });
};

export const useEmployeeStats = (id: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['employee-stats', id, startDate, endDate],
    queryFn: () => employeeService.getStats(id, startDate, endDate),
    enabled: !!id && !!startDate && !!endDate
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeCreateInput) => employeeService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeUpdateInput }) => employeeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    }
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); }
  });
};
