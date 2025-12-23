import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/api/billing';

export function useCreateBilling() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => billingApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['billing'] }) });
}

export function useUpdateBilling() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => billingApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['billing'] }) });
}

export function useDeleteBilling() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => billingApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['billing'] }) });
}
