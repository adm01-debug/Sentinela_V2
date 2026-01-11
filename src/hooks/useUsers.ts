import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import type { User } from '@/types';

export const useUsers = () => {
  return useQuery({ queryKey: ['users'], queryFn: () => userService.list() });
};

export const useUser = (id: string) => {
  return useQuery({ queryKey: ['user', id], queryFn: () => userService.get(id), enabled: !!id });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, 'id' | 'createdAt'>) => userService.create(data),
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
    mutationFn: ({ email, role }: { email: string; role: User['role'] }) => userService.invite(email, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); }
  });
};