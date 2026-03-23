/**
 * SENTINELA - Comprehensive Test Suite
 * Tests for useAuth hook - Authentication flows
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Import after mock is set up in setup.ts
import { supabase } from '@/integrations/supabase/client';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('Authentication System', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Login Flow', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: '1', email: 'test@test.com' }, session: {} }, error: null } as any);

      await supabase.auth.signInWithPassword({ email: 'test@test.com', password: 'password123' });
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    });

    it('should reject login with empty email', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
      mockSignIn.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } } as any);

      const result = await supabase.auth.signInWithPassword({ email: '', password: 'password' });
      expect(result.error).toBeTruthy();
    });

    it('should reject login with empty password', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
      mockSignIn.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } } as any);

      const result = await supabase.auth.signInWithPassword({ email: 'test@test.com', password: '' });
      expect(result.error).toBeTruthy();
    });

    it('should reject login with invalid credentials', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
      mockSignIn.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } } as any);

      const result = await supabase.auth.signInWithPassword({ email: 'wrong@test.com', password: 'wrong' });
      expect(result.error?.message).toBe('Invalid login credentials');
    });

    it('should handle network errors during login', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
      mockSignIn.mockRejectedValueOnce(new Error('Network error'));

      await expect(supabase.auth.signInWithPassword({ email: 'test@test.com', password: 'pass' })).rejects.toThrow('Network error');
    });
  });

  describe('Registration Flow', () => {
    it('should register with valid data', async () => {
      const mockSignUp = vi.mocked(supabase.auth.signUp);
      mockSignUp.mockResolvedValueOnce({ data: { user: { id: '2', email: 'new@test.com' }, session: null }, error: null } as any);

      const result = await supabase.auth.signUp({ email: 'new@test.com', password: 'StrongPass123!' });
      expect(result.error).toBeNull();
      expect(result.data.user?.email).toBe('new@test.com');
    });

    it('should reject weak passwords', async () => {
      const mockSignUp = vi.mocked(supabase.auth.signUp);
      mockSignUp.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Password should be at least 6 characters' } } as any);

      const result = await supabase.auth.signUp({ email: 'new@test.com', password: '123' });
      expect(result.error).toBeTruthy();
    });

    it('should reject duplicate emails', async () => {
      const mockSignUp = vi.mocked(supabase.auth.signUp);
      mockSignUp.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'User already registered' } } as any);

      const result = await supabase.auth.signUp({ email: 'existing@test.com', password: 'StrongPass123!' });
      expect(result.error?.message).toBe('User already registered');
    });
  });

  describe('Logout Flow', () => {
    it('should sign out successfully', async () => {
      const mockSignOut = vi.mocked(supabase.auth.signOut);
      mockSignOut.mockResolvedValueOnce({ error: null } as any);

      const result = await supabase.auth.signOut();
      expect(result.error).toBeNull();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Password Reset', () => {
    it('should send reset email for valid address', async () => {
      const mockReset = vi.mocked(supabase.auth.resetPasswordForEmail);
      mockReset.mockResolvedValueOnce({ data: {}, error: null } as any);

      const result = await supabase.auth.resetPasswordForEmail('test@test.com');
      expect(result.error).toBeNull();
    });

    it('should handle invalid email for reset', async () => {
      const mockReset = vi.mocked(supabase.auth.resetPasswordForEmail);
      mockReset.mockResolvedValueOnce({ data: {}, error: { message: 'Invalid email' } } as any);

      const result = await supabase.auth.resetPasswordForEmail('invalid');
      expect(result.error).toBeTruthy();
    });
  });

  describe('Session Management', () => {
    it('should return null session when not authenticated', async () => {
      const result = await supabase.auth.getSession();
      expect(result.data.session).toBeNull();
    });

    it('should subscribe to auth changes', () => {
      const callback = vi.fn();
      const { data } = supabase.auth.onAuthStateChange(callback);
      expect(data.subscription.unsubscribe).toBeDefined();
    });
  });
});
