import { useCallback, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type SensitiveAction =
  | 'change_password'
  | 'change_email'
  | 'configure_mfa'
  | 'disable_mfa'
  | 'admin_action'
  | 'delete_account'
  | 'update_security_settings';

interface ReauthState {
  isRequired: boolean;
  action: SensitiveAction | null;
  isVerifying: boolean;
  lastVerified: number | null;
  error: string | null;
}

// Reauth required every 5 minutes for sensitive actions
const REAUTH_TIMEOUT_MS = 5 * 60 * 1000;

const SENSITIVE_ACTIONS: ReadonlySet<SensitiveAction> = new Set([
  'change_password',
  'change_email',
  'configure_mfa',
  'disable_mfa',
  'admin_action',
  'delete_account',
  'update_security_settings',
]);

const INITIAL_STATE: ReauthState = {
  isRequired: false,
  action: null,
  isVerifying: false,
  lastVerified: null,
  error: null,
};

/** Maps Supabase Auth errors to friendly PT-BR messages. */
function humanizeReauthError(message: string | undefined, kind: 'password' | 'mfa'): string {
  const raw = (message ?? '').toLowerCase();
  if (!raw) return kind === 'password' ? 'Senha incorreta' : 'Código MFA inválido';
  if (raw.includes('invalid login') || raw.includes('invalid credentials') || raw.includes('invalid password')) {
    return 'Senha incorreta';
  }
  if (raw.includes('invalid code') || raw.includes('invalid_totp') || raw.includes('invalid otp')) {
    return 'Código MFA inválido ou expirado';
  }
  if (raw.includes('expired')) return 'Código expirado. Gere um novo e tente novamente.';
  if (raw.includes('rate') || raw.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
  }
  if (raw.includes('network') || raw.includes('fetch')) {
    return 'Falha de conexão. Verifique sua internet.';
  }
  return kind === 'password' ? 'Não foi possível verificar sua senha' : 'Não foi possível verificar o código MFA';
}

export function useReauthentication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ReauthState>(INITIAL_STATE);

  const isRecentlyVerified = useCallback((): boolean => {
    if (!state.lastVerified) return false;
    return Date.now() - state.lastVerified < REAUTH_TIMEOUT_MS;
  }, [state.lastVerified]);

  const requiresReauth = useCallback(
    (action: SensitiveAction): boolean => {
      if (!SENSITIVE_ACTIONS.has(action)) return false;
      return !isRecentlyVerified();
    },
    [isRecentlyVerified],
  );

  const requestReauth = useCallback((action: SensitiveAction) => {
    setState((prev) => ({ ...prev, isRequired: true, action, error: null }));
  }, []);

  const cancelReauth = useCallback(() => {
    setState((prev) => ({ ...prev, isRequired: false, action: null, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => (prev.error ? { ...prev, error: null } : prev));
  }, []);

  const verifyPassword = useCallback(
    async (password: string): Promise<boolean> => {
      if (!user?.email) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return false;
      }
      if (!password) {
        setState((prev) => ({ ...prev, error: 'Informe sua senha' }));
        return false;
      }

      setState((prev) => ({ ...prev, isVerifying: true, error: null }));

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

        if (error) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            error: humanizeReauthError(error.message, 'password'),
          }));
          return false;
        }

        setState({
          isRequired: false,
          action: null,
          isVerifying: false,
          lastVerified: Date.now(),
          error: null,
        });

        toast({
          title: 'Verificado',
          description: 'Identidade confirmada com sucesso',
        });

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : undefined;
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          error: humanizeReauthError(message, 'password'),
        }));
        return false;
      }
    },
    [user, toast],
  );

  const verifyMFA = useCallback(
    async (code: string): Promise<boolean> => {
      const cleanCode = code.replace(/\D/g, '');
      if (cleanCode.length !== 6) {
        setState((prev) => ({ ...prev, error: 'Digite o código de 6 dígitos' }));
        return false;
      }

      setState((prev) => ({ ...prev, isVerifying: true, error: null }));

      try {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const totpFactor = factors?.totp?.find((f) => f.status === 'verified');

        if (!totpFactor) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            error: 'MFA não configurado para esta conta',
          }));
          return false;
        }

        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });
        if (challengeError) throw challengeError;

        const { error } = await supabase.auth.mfa.verify({
          factorId: totpFactor.id,
          challengeId: challenge.id,
          code: cleanCode,
        });

        if (error) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            error: humanizeReauthError(error.message, 'mfa'),
          }));
          return false;
        }

        setState({
          isRequired: false,
          action: null,
          isVerifying: false,
          lastVerified: Date.now(),
          error: null,
        });

        toast({
          title: 'Verificado',
          description: 'Identidade confirmada via MFA',
        });

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : undefined;
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          error: humanizeReauthError(message, 'mfa'),
        }));
        return false;
      }
    },
    [toast],
  );

  const executeWithReauth = useCallback(
    async <T,>(
      action: SensitiveAction,
      callback: () => Promise<T>,
    ): Promise<{ success: boolean; result?: T; error?: Error }> => {
      if (requiresReauth(action)) {
        requestReauth(action);
        return { success: false };
      }

      try {
        const result = await callback();
        return { success: true, result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Erro desconhecido'),
        };
      }
    },
    [requiresReauth, requestReauth],
  );

  return useMemo(
    () => ({
      ...state,
      isRecentlyVerified: isRecentlyVerified(),
      requiresReauth,
      requestReauth,
      verifyPassword,
      verifyMFA,
      cancelReauth,
      clearError,
      executeWithReauth,
    }),
    [
      state,
      isRecentlyVerified,
      requiresReauth,
      requestReauth,
      verifyPassword,
      verifyMFA,
      cancelReauth,
      clearError,
      executeWithReauth,
    ],
  );
}
