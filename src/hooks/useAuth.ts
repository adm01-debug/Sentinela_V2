import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import { useAuthStore } from '@/stores';

// ============================================================
// HOOK PRINCIPAL - useAuth
// ============================================================
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, setUser, setToken, logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();

  const { isLoading, error, refetch } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    onSuccess: (data) => {
      if (data) setUser(data);
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
    },
  });

  return {
    user: user as User | null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: error?.message || loginMutation.error?.message || null,
    login: async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refresh: async () => {
      await refetch();
    },
  };
}

// ============================================================
// HOOKS ESPECÍFICOS (mantidos para retrocompatibilidade)
// ============================================================

export const useLogin = () => {
  const { setUser, setToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password),
    onSuccess: (data) => { 
      setUser(data.user); 
      setToken(data.token); 
    }
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => { 
      logout(); 
      queryClient.clear(); 
    }
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({ 
    queryKey: ['current-user'], 
    queryFn: () => authService.me(), 
    enabled: isAuthenticated 
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['current-user'] }); 
    }
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword)
  });
};

export const useSessions = () => {
  return useQuery({ 
    queryKey: ['sessions'], 
    queryFn: () => authService.getSessions() 
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['sessions'] }); 
    }
  });
};

export default useAuth;
