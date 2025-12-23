import { useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '@/api/integrations';

export function useCreateIntegrations() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => integrationsApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }) });
}

export function useUpdateIntegrations() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => integrationsApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }) });
}

export function useDeleteIntegrations() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => integrationsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }) });
}
