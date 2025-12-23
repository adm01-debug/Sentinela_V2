import { useQuery } from '@tanstack/react-query';
import { geofencesApi } from '@/api/geofences';

export const useGeofencesQueryKeys = {
  all: ['geofences'] as const,
  list: (f: any) => [...useGeofencesQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...useGeofencesQueryKeys.all, 'detail', id] as const,
};

export function useGeofencesQuery() {
  return useQuery({ queryKey: useGeofencesQueryKeys.all, queryFn: () => geofencesApi.list() });
}

export function useGeofencesQueryById(id: string) {
  return useQuery({ queryKey: useGeofencesQueryKeys.detail(id), queryFn: () => geofencesApi.get(id), enabled: !!id });
}
