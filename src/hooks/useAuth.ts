import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);
  const signOut = useCallback(async () => supabase.auth.signOut(), []);
  const signUp = useCallback(async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  }, []);
  return { signIn, signOut, signUp };
}