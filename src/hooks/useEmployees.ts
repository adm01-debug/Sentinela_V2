import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services';
import type { EmployeeFilters, CreateEmployeeInput, UpdateEmployeeInput } from '@/types';

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
    mutationFn: (data: CreateEmployeeInput) => employeeService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeInput }) => employeeService.update(id, data),
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