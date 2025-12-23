import { useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '@/api/policies';

export function useCreatePolicies() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => policiesApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['policies'] }) });
}

export function useUpdatePolicies() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => policiesApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['policies'] }) });
}

export function useDeletePolicies() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => policiesApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['policies'] }) });
}
