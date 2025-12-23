import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '@/api/employees';
import { employeesQueryKeys } from '@/queries/useEmployeesQuery';

export function useCreateEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => employeesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesQueryKeys.all }),
  });
}

export function useUpdateEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => employeesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesQueryKeys.all }),
  });
}

export function useDeleteEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesQueryKeys.all }),
  });
}
