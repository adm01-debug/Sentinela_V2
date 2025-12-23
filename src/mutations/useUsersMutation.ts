import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { usersQueryKeys } from '@/queries/useUsersQuery';

export function useCreateUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersQueryKeys.all }),
  });
}

export function useUpdateUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersQueryKeys.all }),
  });
}

export function useDeleteUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersQueryKeys.all }),
  });
}
