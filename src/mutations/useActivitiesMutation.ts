import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/api/activities';
import { activitiesQueryKeys } from '@/queries/useActivitiesQuery';

export function useCreateActivities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => activitiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: activitiesQueryKeys.all }),
  });
}

export function useUpdateActivities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => activitiesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: activitiesQueryKeys.all }),
  });
}

export function useDeleteActivities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: activitiesQueryKeys.all }),
  });
}
