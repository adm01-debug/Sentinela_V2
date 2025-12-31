import { useState, useCallback } from 'react';
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

// Re-auth required every 5 minutes for sensitive actions
const REAUTH_TIMEOUT_MS = 5 * 60 * 1000;

export function useReauthentication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ReauthState>({
    isRequired: false,
    action: null,
    isVerifying: false,
    lastVerified: null,
    error: null,
  });

  const requiresReauth = useCallback((action: SensitiveAction): boolean => {
    const sensitiveActions: SensitiveAction[] = [
      'change_password',
      'change_email',
      'configure_mfa',
      'disable_mfa',
      'admin_action',
      'delete_account',
      'update_security_settings',
    ];

    if (!sensitiveActions.includes(action)) return false;

    // Check if recently verified
    if (state.lastVerified) {
      const timeSinceLastVerification = Date.now() - state.lastVerified;
      if (timeSinceLastVerification < REAUTH_TIMEOUT_MS) {
        return false;
      }
    }

    return true;
  }, [state.lastVerified]);

  const requestReauth = useCallback((action: SensitiveAction) => {
    setState(prev => ({
      ...prev,
      isRequired: true,
      action,
      error: null,
    }));
  }, []);

  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.email) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      // Re-authenticate by signing in again
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (error) {
        setState(prev => ({
          ...prev,
          isVerifying: false,
          error: 'Senha incorreta',
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        isVerifying: false,
        isRequired: false,
        lastVerified: Date.now(),
        error: null,
      }));

      toast({
        title: 'Verificado',
        description: 'Identidade confirmada com sucesso',
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar senha';
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: message,
      }));
      return false;
    }
  }, [user, toast]);

  const verifyMFA = useCallback(async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find(f => f.status === 'verified');

      if (!totpFactor) {
        setState(prev => ({
          ...prev,
          isVerifying: false,
          error: 'MFA não configurado',
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
        code,
      });

      if (error) {
        setState(prev => ({
          ...prev,
          isVerifying: false,
          error: 'Código MFA inválido',
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        isVerifying: false,
        isRequired: false,
        lastVerified: Date.now(),
        error: null,
      }));

      toast({
        title: 'Verificado',
        description: 'Identidade confirmada via MFA',
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar MFA';
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: message,
      }));
      return false;
    }
  }, [toast]);

  const cancelReauth = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRequired: false,
      action: null,
      error: null,
    }));
  }, []);

  const executeWithReauth = useCallback(async <T>(
    action: SensitiveAction,
    callback: () => Promise<T>
  ): Promise<{ success: boolean; result?: T }> => {
    if (requiresReauth(action)) {
      requestReauth(action);
      return { success: false };
    }

    try {
      const result = await callback();
      return { success: true, result };
    } catch (error) {
      return { success: false };
    }
  }, [requiresReauth, requestReauth]);

  return {
    ...state,
    requiresReauth,
    requestReauth,
    verifyPassword,
    verifyMFA,
    cancelReauth,
    executeWithReauth,
  };
}
