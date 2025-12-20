import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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
// CONSTANTES
// ============================================================

// Refresh 5 minutos antes de expirar
const REFRESH_MARGIN_SECONDS = 5 * 60;

// Verificar sessão a cada 1 minuto
const SESSION_CHECK_INTERVAL = 60 * 1000;

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
        console.log('Sessão renovada com sucesso');
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
      console.log(`Sessão expira em ${timeUntilExpiry}s, renovando...`);
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

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Check admin role when user changes
        if (newSession?.user) {
          // Use setTimeout to avoid deadlock
          setTimeout(() => {
            checkAdminRole(newSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }

        // Limpar cache quando usuário muda
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
          setIsAdmin(false);
        }

        // Quando token é renovado automaticamente pelo Supabase
        if (event === 'TOKEN_REFRESHED' && newSession) {
          console.log('Token renovado pelo Supabase');
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
 * Hook para verificar se usuário tem role específica
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  return userRole === role;
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
