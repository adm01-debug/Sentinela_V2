import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth';

interface User { id: string; email: string; name: string; role: string; }
interface AuthContextType { user: User | null; isLoading: boolean; isAuthenticated: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setIsLoading(false)); }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login({ email, password });
    setUser(user);
  }, []);

  const logout = useCallback(async () => { await authApi.logout(); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be within AuthProvider'); return ctx; };
