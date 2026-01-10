import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  fullName?: string;
  organizationName?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn({ email, password }: AuthCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error as Error | null,
    };
  },

  /**
   * Sign up with email and password
   */
  async signUp({ email, password, fullName, organizationName }: SignUpData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: organizationName,
        },
      },
    });
    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error as Error | null,
    };
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error as Error | null };
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data?.session ?? null;
  },

  /**
   * Get the current user
   */
  async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  },

  /**
   * Reset password for email
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  },

  /**
   * Verify OTP token
   */
  async verifyOtp(email: string, token: string, type: 'email' | 'sms' = 'email'): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type === 'email' ? 'email' : 'sms',
    });
    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error as Error | null,
    };
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession();
    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error as Error | null,
    };
  },
};

export default authService;
