import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '@/api/teams';
import { teamsQueryKeys } from '@/queries/useTeamsQuery';

export function useCreateTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teamsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamsQueryKeys.all }),
  });
}

export function useUpdateTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => teamsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamsQueryKeys.all }),
  });
}

export function useDeleteTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamsQueryKeys.all }),
  });
}
