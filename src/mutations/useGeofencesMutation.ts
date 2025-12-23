import { useMutation, useQueryClient } from '@tanstack/react-query';
import { geofencesApi } from '@/api/geofences';

export function useCreateGeofences() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => geofencesApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['geofences'] }) });
}

export function useUpdateGeofences() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => geofencesApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['geofences'] }) });
}

export function useDeleteGeofences() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => geofencesApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['geofences'] }) });
}
