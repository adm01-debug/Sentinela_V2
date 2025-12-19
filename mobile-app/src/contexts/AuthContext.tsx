import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão salva
    checkSession();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          await SecureStore.setItemAsync('session', JSON.stringify(session));
        } else {
          await SecureStore.deleteItemAsync('session');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    try {
      const savedSession = await SecureStore.getItemAsync('session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const { data, error } = await supabase.auth.setSession(session);
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    setSession(data.session);
    setUser(data.user);
  }

  async function signOut() {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('session');
    setSession(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
