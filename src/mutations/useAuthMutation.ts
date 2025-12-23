import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { authQueryKeys } from '@/queries/useAuthQuery';

export function useCreateAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: authQueryKeys.all }),
  });
}

export function useUpdateAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => authApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: authQueryKeys.all }),
  });
}

export function useDeleteAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: authQueryKeys.all }),
  });
}
