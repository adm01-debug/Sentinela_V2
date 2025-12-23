import { useMutation, useQueryClient } from '@tanstack/react-query';
import { violationsApi } from '@/api/violations';
import { violationsQueryKeys } from '@/queries/useViolationsQuery';

export function useCreateViolations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => violationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: violationsQueryKeys.all }),
  });
}

export function useUpdateViolations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => violationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: violationsQueryKeys.all }),
  });
}

export function useDeleteViolations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => violationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: violationsQueryKeys.all }),
  });
}
