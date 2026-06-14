import type { User as SupaUser, Session as SupaSession } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/providers/AuthProvider';

export const authService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async checkAdminRole(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  },

  mapSupabaseUser(supaUser: SupaUser | undefined | null): User | null {
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
  },

  onAuthStateChange(callback: (session: SupaSession | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return subscription;
  },

  async updateProfile(data: Record<string, unknown>) {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) throw error;
  },

  async changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
};

export default authService;
