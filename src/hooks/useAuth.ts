import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import { useAuthStore } from '@/stores';

export const useLogin = () => {
  const { setUser, setToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authService.login(email, password),
    onSuccess: (data) => { setUser(data.user); setToken(data.token); }
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => { logout(); queryClient.clear(); }
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({ queryKey: ['current-user'], queryFn: () => authService.me(), enabled: isAuthenticated });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['current-user'] }); }
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword)
  });
};

export const useSessions = () => {
  return useQuery({ queryKey: ['sessions'], queryFn: () => authService.getSessions() });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sessions'] }); }
  });
};