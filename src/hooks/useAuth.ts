import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import { useAuthStore } from '@/stores';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: any;
  avatar?: string;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Session {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
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

  const { isLoading, error, refetch, data } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password),
    onSuccess: (data) => {
      setUser(data.user as any);
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
    session: null,
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
