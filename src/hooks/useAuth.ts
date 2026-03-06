import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session as SupaSession } from '@supabase/supabase-js';

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

function mapSupabaseUser(supaUser: any): User | null {
  if (!supaUser) return null;
  return {
    id: supaUser.id,
    email: supaUser.email || '',
    name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0],
    avatar: supaUser.user_metadata?.avatar_url,
    role: supaUser.user_metadata?.role || 'user',
    isAdmin: false, // Will be checked via user_roles table
    createdAt: supaUser.created_at,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supaSession, setSupaSession] = useState<SupaSession | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSupaSession(data.session);
      setUser(mapSupabaseUser(data.session?.user));
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupaSession(session);
      setUser(mapSupabaseUser(session?.user));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupaSession(null);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSupaSession(data.session);
    setUser(mapSupabaseUser(data.session?.user));
  }, []);

  return {
    user,
    session: null,
    isAuthenticated: !!supaSession,
    isLoading,
    error,
    login,
    logout,
    refresh,
  };
}

// Re-export convenience hooks that use Supabase
export const useUpdateProfile = () => {
  const [isPending, setIsPending] = useState(false);
  return {
    mutateAsync: async (data: Partial<User>) => {
      setIsPending(true);
      try {
        const { error } = await supabase.auth.updateUser({ data });
        if (error) throw error;
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};

export const useChangePassword = () => {
  const [isPending, setIsPending] = useState(false);
  return {
    mutateAsync: async ({ newPassword }: { currentPassword: string; newPassword: string }) => {
      setIsPending(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};

export default useAuth;
