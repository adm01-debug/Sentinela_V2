import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
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
  isRoleLoading: boolean;
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

// ============================================================
// PROVIDER
// ============================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Separate flag for role resolution: stays true until checkAdminRole resolves.
  // Route guards (SupervisorGuard/AdminGuard) read `isRoleLoading` so they don't
  // render an early `<Navigate to="/dashboard">` based on a stale `role: 'user'`.
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  // Ref accessible inside async callbacks (resolveUser .finally, etc.) to guard
  // against setting state after the component has unmounted.
  const mountedRef = useRef(true);

  const resolveUser = useCallback(async (supaUser: SupaUser | undefined | null) => {
    if (!supaUser) {
      setUser(null);
      setIsRoleLoading(false);
      setIsLoading(false);
      return;
    }

    const mapped = mapSupabaseUser(supaUser);
    if (mapped) {
      // Commit the metadata-derived role immediately so route guards have *something*.
      // Then run the real admin-role query in the background and update the role
      // if it disagrees. The isRoleLoading flag stays true until either:
      //   (a) the real query resolves (best case, ~100ms), OR
      //   (b) the safety timeout fires (3s) — at which point we assume 'user'
      //        but keep the real query running so it can still update the role.
      setUser(mapped);
      setIsRoleLoading(true);
      setIsLoading(false);

      let queryDone = false;
      let resolvedIsAdmin = false;

      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', mapped.id)
        .eq('role', 'admin')
        .maybeSingle()
        .then((res) => {
          if (res.error && res.error.code !== 'PGRST116') {
            logger.warn(`[AuthProvider] Role check warning for ${mapped.id}:`, res.error.message);
          }
          resolvedIsAdmin = !!res.data;
        })
        .catch((err) => {
          logger.error('[AuthProvider] checkAdminRole failed:', err);
        })
        .finally(() => {
          queryDone = true;
          if (!mountedRef.current) return;
          // Always re-commit the user with the truth once the query settles,
          // even if the timeout already released isRoleLoading.
          setUser((current) => {
            if (!current) return current;
            return {
              ...current,
              isAdmin: resolvedIsAdmin,
              role: resolvedIsAdmin ? 'admin' : (current.role === 'admin' ? 'user' : current.role || 'user'),
            };
          });
          // Only flip isRoleLoading if the timeout hasn't already done it.
          // The timeout handler is the source of truth for "give up waiting."
        });

      // Safety net: if the query takes too long, release isRoleLoading so the
      // UI can render. The query above will still update the role when it lands.
      setTimeout(() => {
        if (!queryDone) {
          logger.warn(`[AuthProvider] Role check timed out for ${mapped.id}; releasing UI`);
        }
        if (mountedRef.current) setIsRoleLoading(false);
      }, 3000);
    } else {
      setUser(null);
      setIsRoleLoading(false);
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!session?.user && !!user && !isRoleLoading;

  useEffect(() => {
    mountedRef.current = true;

    // Initial session check
    const initSession = async () => {
      // Safety timeout: if getSession() hangs (bad token in localStorage, slow
      // network, stuck supabase-js), unblock the UI after 8s so the user can
      // reach the login screen instead of staring at the splash forever.
      const safetyTimeout = setTimeout(() => {
        if (mountedRef.current) {
          logger.warn('[AuthProvider] getSession() timed out after 8s, releasing loading state');
          setIsLoading(false);
        }
      }, 8000);

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mountedRef.current) {
          setSession(data.session);
          if (data.session?.user) {
            await resolveUser(data.session.user);
          } else {
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (err) {
        logger.error('[AuthProvider] Initial session error:', err);
        if (mountedRef.current) setIsLoading(false);
      } finally {
        clearTimeout(safetyTimeout);
      }
    };

    initSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      logger.info(`[AuthProvider] Auth event: ${event}`);
      
      if (mountedRef.current) {
        setSession(newSession);
        if (newSession?.user) {
          await resolveUser(newSession.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mountedRef.current = false;
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

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated,
    isLoading,
    isRoleLoading,
    error,
    login,
    logout,
    refresh,
  }), [user, session, isAuthenticated, isLoading, isRoleLoading, error, login, logout, refresh]);

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
