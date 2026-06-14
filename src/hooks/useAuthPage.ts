import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/validators/schemas';

// ============================================================
// RATE LIMITING WITH EXPONENTIAL BACKOFF
// ============================================================

const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30 * 1000; // 30 seconds base
const MAX_LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes max

// Persist rate limit state in localStorage to survive page refreshes
const RATE_LIMIT_STORAGE_KEY = 'auth_rate_limit';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
  lockoutLevel: number; // For exponential backoff tracking
}

function loadRateLimitState(): RateLimitState {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (typeof parsed.attempts === 'number' && typeof parsed.lockoutLevel === 'number') {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return { attempts: 0, lockoutUntil: null, lockoutLevel: 0 };
}

function saveRateLimitState(state: RateLimitState): void {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

function calculateLockoutDuration(level: number): number {
  // Exponential backoff: 30s, 1min, 2min, 4min, 8min, 16min, 30min (capped)
  const duration = BASE_LOCKOUT_MS * Math.pow(2, level);
  return Math.min(duration, MAX_LOCKOUT_MS);
}

function formatTimeRemaining(ms: number): string {
  if (ms < 60000) {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(ms / 60000);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}

export function useAuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  
  // Rate limiting state - load from localStorage
  const rateLimitRef = useRef<RateLimitState>(loadRateLimitState());

  // Check if user is rate limited
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = rateLimitRef.current;
    
    if (state.lockoutUntil && now < state.lockoutUntil) {
      const remainingMs = state.lockoutUntil - now;

      toast({
        title: '⏳ Conta bloqueada temporariamente', 
        description: `Muitas tentativas falhas. Aguarde ${formatTimeRemaining(remainingMs)} antes de tentar novamente.`, 
        variant: 'destructive' 
      });
      return false;
    }
    
    // Reset attempts if lockout expired, but keep lockoutLevel for progressive penalties
    if (state.lockoutUntil && now >= state.lockoutUntil) {
      state.attempts = 0;
      state.lockoutUntil = null;
      saveRateLimitState(state);
    }
    
    return true;
  }, [toast]);

  // Record failed attempt with exponential backoff
  const recordFailedAttempt = useCallback(() => {
    const state = rateLimitRef.current;
    state.attempts++;
    
    if (state.attempts >= MAX_ATTEMPTS) {
      const lockoutDuration = calculateLockoutDuration(state.lockoutLevel);
      state.lockoutUntil = Date.now() + lockoutDuration;
      state.lockoutLevel = Math.min(state.lockoutLevel + 1, 6); // Cap at level 6 (30 min)
      
      saveRateLimitState(state);
      
      toast({ 
        title: '🔒 Conta bloqueada', 
        description: `${MAX_ATTEMPTS} tentativas falhas. Bloqueado por ${formatTimeRemaining(lockoutDuration)}.`, 
        variant: 'destructive' 
      });
    } else {
      saveRateLimitState(state);
      
      const remaining = MAX_ATTEMPTS - state.attempts;
      if (remaining <= 2) {
        toast({ 
          title: '⚠️ Atenção', 
          description: `Restam ${remaining} tentativa${remaining !== 1 ? 's' : ''} antes do bloqueio.`, 
          variant: 'destructive' 
        });
      }
    }
  }, [toast]);

  // Reset attempts on success
  const resetAttempts = useCallback(() => {
    rateLimitRef.current = { attempts: 0, lockoutUntil: null, lockoutLevel: 0 };
    saveRateLimitState(rateLimitRef.current);
  }, []);

  // ============================================================
  // MUTATIONS
  // ============================================================

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Validate with central schema
      loginSchema.parse({ email, password });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => { 
      resetAttempts();
      toast({ title: 'Login realizado!' }); 
      navigate('/'); 
    },
    onError: (_e: Error) => {
      recordFailedAttempt();
      // Generic error message to prevent user enumeration
      toast({ 
        title: 'Erro de autenticação', 
        description: 'Email ou senha incorretos', 
        variant: 'destructive' 
      }); 
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Validate inputs
      registerSchema.parse({ 
        email, 
        password, 
        confirmPassword: password, // For simplification since we don't have separate confirm field in UI yet
        fullName: name 
      });
      
      const { data, error } = await supabase.auth.signUp({ 
        email: email.toLowerCase().trim(), 
        password, 
        options: { 
          data: { 
            name: name.trim(), 
            company: company.trim().slice(0, 100) 
          },
          emailRedirectTo: `${window.location.origin}/`
        } 
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => { 
      toast({ 
        title: 'Cadastro realizado!',
        description: 'Verifique seu email para confirmar a conta.'
      }); 
      setMode('login'); 
      // Clear sensitive data
      setPassword('');
    },
    onError: (e: Error) => { 
      logger.error('Registration error:', e);
      
      // Check for specific errors
      const errorMessage = e.message.toLowerCase();
      
      if (errorMessage.includes('already registered') || errorMessage.includes('user already registered')) {
        toast({ 
          title: 'Email já cadastrado', 
          description: 'Use outro email ou faça login', 
          variant: 'destructive' 
        }); 
      } else if (errorMessage.includes('invalid email') || errorMessage.includes('email')) {
        toast({ 
          title: 'Email inválido', 
          description: 'Verifique o formato do email', 
          variant: 'destructive' 
        }); 
      } else if (errorMessage.includes('password') || errorMessage.includes('senha')) {
        toast({ 
          title: 'Senha inválida', 
          description: e.message, 
          variant: 'destructive' 
        }); 
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        toast({ 
          title: 'Muitas tentativas', 
          description: 'Aguarde alguns minutos e tente novamente', 
          variant: 'destructive' 
        }); 
      } else if (errorMessage.includes('signups not allowed') || errorMessage.includes('signup_disabled')) {
        toast({ 
          title: 'Cadastro desativado', 
          description: 'O cadastro de novos usuários está temporariamente desativado', 
          variant: 'destructive' 
        }); 
      } else {
        // Show the actual error for debugging
        toast({ 
          title: 'Erro no cadastro', 
          description: e.message || 'Verifique os dados e tente novamente', 
          variant: 'destructive' 
        }); 
      }
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async () => {
      forgotPasswordSchema.parse({ email });
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });
      if (error) throw error;
    },
    onSuccess: () => { 
      // Always show success to prevent email enumeration
      toast({ 
        title: 'Email enviado!',
        description: 'Se o email estiver cadastrado, você receberá instruções.'
      }); 
      setMode('login'); 
    },
    onError: () => {
      // Always show success to prevent email enumeration
      toast({ 
        title: 'Email enviado!',
        description: 'Se o email estiver cadastrado, você receberá instruções.'
      }); 
      setMode('login'); 
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => { 
      toast({ title: 'Senha atualizada com sucesso!' }); 
      setPassword('');
      navigate('/'); 
    },
    onError: (e: Error) => {
      toast({ 
        title: 'Erro ao atualizar senha', 
        description: e.message, 
        variant: 'destructive' 
      }); 
    },
  });

  // ============================================================
  // HANDLERS WITH RATE LIMITING
  // ============================================================

  const handleLogin = useCallback(() => {
    if (!checkRateLimit()) return;
    loginMutation.mutate();
  }, [loginMutation, checkRateLimit]);

  const handleRegister = useCallback(() => {
    registerMutation.mutate();
  }, [registerMutation]);

  const handleForgot = useCallback(() => {
    forgotMutation.mutate();
  }, [forgotMutation]);

  const handleReset = useCallback(() => {
    resetMutation.mutate();
  }, [resetMutation]);

  return {
    mode, email, password, name, company,
    setMode, setEmail, setPassword, setName, setCompany,
    handleLogin,
    handleRegister,
    handleForgot,
    handleReset,
    isLoading: loginMutation.isPending || registerMutation.isPending || forgotMutation.isPending || resetMutation.isPending,
  };
}
