import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';

// ============================================================
// TYPES
// ============================================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// CONSTANTES - Configuração de Sessão 24 horas
// ============================================================

// Sessão expira em 24 horas (configuração do Supabase Auth)
const SESSION_DURATION_HOURS = 24;

// Refresh 30 minutos antes de expirar para garantir continuidade
const REFRESH_MARGIN_SECONDS = 30 * 60;

// Verificar sessão a cada 5 minutos
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Inatividade máxima: renovar ao retornar se >5min inativo
const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000;

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();

  // ============================================================
  // CHECK ADMIN ROLE
  // ============================================================

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    } catch (err) {
      console.error('Failed to check admin role:', err);
      setIsAdmin(false);
    }
  }, []);

  // ============================================================
  // REFRESH TOKEN LOGIC
  // ============================================================

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        // Se falhar, fazer logout
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          await signOut();
        }
        return;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (import.meta.env.DEV) console.log('Sessão renovada com sucesso')
      }
    } catch (error) {
      console.error('Erro inesperado ao renovar sessão:', error);
    }
  }, []);

  // Verificar se precisa renovar a sessão
  const checkAndRefreshSession = useCallback(async () => {
    if (!session?.expires_at) return;

    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;

    // Se estiver próximo de expirar, renovar
    if (timeUntilExpiry <= REFRESH_MARGIN_SECONDS && timeUntilExpiry > 0) {
      if (import.meta.env.DEV) console.log(`Sessão expira em ${timeUntilExpiry}s, renovando...`)
      await refreshSession();
    }
  }, [session, refreshSession]);

  // ============================================================
  // EFFECTS
  // ============================================================

  // Inicializar sessão
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Check admin role
          await checkAdminRole(currentSession.user.id);
          
          // Verificar se precisa renovar imediatamente
          const expiresAt = currentSession.expires_at;
          if (expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            if (expiresAt - now <= REFRESH_MARGIN_SECONDS) {
              await refreshSession();
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [refreshSession, checkAdminRole]);

  // Listener para mudanças de autenticação - SÍNCRONO para evitar deadlock
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (import.meta.env.DEV) console.log('Auth event:', event);
        
        // Atualizações síncronas de estado
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Check admin role com setTimeout para evitar deadlock
        if (newSession?.user) {
          setTimeout(() => {
            checkAdminRole(newSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }

        // Limpar cache quando usuário sair - usar setTimeout
        if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            queryClient.clear();
          }, 0);
          setIsAdmin(false);
        }

        // Log de token renovado
        if (event === 'TOKEN_REFRESHED' && newSession) {
          if (import.meta.env.DEV) console.log('Token renovado pelo Supabase');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, checkAdminRole]);

  // Verificar sessão periodicamente
  useEffect(() => {
    if (!session) return;

    const intervalId = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [session, checkAndRefreshSession]);

  // Renovar quando a janela ganha foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session) {
        checkAndRefreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session, checkAndRefreshSession]);

  // ============================================================
  // AUTH METHODS
  // ============================================================

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthenticationError(error.message, error);
    }

    setSession(data.session);
    setUser(data.user);
    
    // Check admin role after sign in
    if (data.user) {
      await checkAdminRole(data.user.id);
      
      // Trigger device detection after successful login (deferred to avoid blocking)
      setTimeout(async () => {
        try {
          const { useDeviceDetection } = await import('./useDeviceDetection');
          const { checkAndRegisterDevice } = useDeviceDetection();
          await checkAndRegisterDevice(data.user.id, data.user.email || email);
        } catch (e) {
          console.error('Error in device detection:', e);
        }
      }, 0);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      throw new AuthenticationError(error.message, error);
    }

    // Supabase pode retornar usuário sem sessão se precisar confirmar email
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
    }
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro ao fazer logout:', error);
    }

    setSession(null);
    setUser(null);
    setIsAdmin(false);
    queryClient.clear();
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (error) {
      throw new AuthenticationError(error.message, error);
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AuthenticationError(error.message, error);
    }
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

// ============================================================
// ERROR CLASS
// ============================================================

export class AuthenticationError extends Error {
  public originalError: AuthError;

  constructor(message: string, originalError: AuthError) {
    super(message);
    this.name = 'AuthenticationError';
    this.originalError = originalError;
  }
}

// ============================================================
// HELPER HOOKS
// ============================================================

/**
 * Hook SEGURO para verificar se usuário tem role específica
 * Consulta a tabela user_roles no banco (não usa metadata do cliente)
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  
  const { data: hasRole } = useQuery({
    queryKey: ['user-role-check', user?.id, role],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', role)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking role:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  });
  
  return hasRole ?? false;
}

/**
 * Hook SEGURO para obter todas as roles do usuário
 * Consulta a tabela user_roles no banco
 */
export function useUserRoles(): string[] {
  const { user } = useAuth();
  
  const { data: roles } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
      
      return data?.map(r => r.role) ?? [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  return roles ?? [];
}

/**
 * Hook para obter o ID do usuário atual
 */
export function useCurrentUserId(): string | null {
  const { user } = useAuth();
  return user?.id || null;
}

/**
 * Hook para obter email do usuário atual
 */
export function useCurrentUserEmail(): string | null {
  const { user } = useAuth();
  return user?.email || null;
}
