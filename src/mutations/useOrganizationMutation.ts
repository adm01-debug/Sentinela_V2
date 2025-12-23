import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization';

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => organizationApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['organization'] }) });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => organizationApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['organization'] }) });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => organizationApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['organization'] }) });
}
