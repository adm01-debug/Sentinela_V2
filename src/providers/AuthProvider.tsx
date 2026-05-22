import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session as SupaSession, User as SupaUser } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
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

export interface AuthContextType {
  user: User | null;
  session: SupaSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// HELPERS
// ============================================================

function mapSupabaseUser(supaUser: SupaUser | undefined | null): User | null {
  if (!supaUser) return null;
  return {
    id: supaUser.id,
    email: supaUser.email || '',
    name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0],
    avatar: supaUser.user_metadata?.avatar_url,
    role: supaUser.user_metadata?.role || 'user',
    isAdmin: false,
    createdAt: supaUser.created_at,
  };
}

async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) {
      if (error.code !== 'PGRST116') { // maybeSingle empty result is not an error we care about here
         logger.warn('[AuthProvider] Role check warning:', error.message);
      }
      return false;
    }
    return !!data;
  } catch (err) {
    logger.error('[AuthProvider] Failed to check admin role:', err);
    return false;
  }
}

// ============================================================
// PROVIDER
// ============================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveUser = useCallback(async (supaUser: SupaUser | undefined | null) => {
    if (!supaUser) {
      setUser(null);
      return;
    }

    const mapped = mapSupabaseUser(supaUser);
    if (mapped) {
      const isAdmin = await checkAdminRole(mapped.id);
      mapped.isAdmin = isAdmin;
      mapped.role = isAdmin ? 'admin' : (mapped.role || 'user');
    }
    setUser(mapped);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(data.session);
          if (data.session?.user) {
            await resolveUser(data.session.user);
          }
        }
      } catch (err) {
        logger.error('[AuthProvider] Initial session error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      logger.info(`[AuthProvider] Auth event: ${event}`);
      
      if (mounted) {
        setSession(newSession);
        if (newSession?.user) {
          await resolveUser(newSession.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resolveUser]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.error('[AuthProvider] Logout error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(data.session);
      await resolveUser(data.session?.user);
    } catch (err) {
      logger.error('[AuthProvider] Session refresh error:', err);
    }
  }, [resolveUser]);

  const value = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    error,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// HOOK
// ============================================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
