import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';

// Stub userService for compatibility
const userService = {
  list: async () => [] as User[],
  get: async (id: string) => ({} as User),
  create: async (data: any) => ({} as User),
  update: async (id: string, data: any) => ({} as User),
  delete: async (id: string) => {},
  invite: async (email: string, role: any) => {},
};

export const useUsers = () => {
  return useQuery({ queryKey: ['users'], queryFn: () => userService.list() });
};

export const useUser = (id: string) => {
  return useQuery({ queryKey: ['user', id], queryFn: () => userService.get(id), enabled: !!id });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => userService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); }
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: any }) => userService.invite(email, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); }
  });
};
