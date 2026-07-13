import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

export interface PhoneMFAState {
  isEnrolling: boolean;
  isVerifying: boolean;
  phoneNumber: string;
  factorId: string | null;
  error: string | null;
}

const INITIAL_STATE: PhoneMFAState = {
  isEnrolling: false,
  isVerifying: false,
  phoneNumber: '',
  factorId: null,
  error: null,
};

/**
 * Normaliza um número BR para o formato E.164 (+55DDDNNNNNNNNN).
 * Retorna null se não for possível derivar 11 dígitos após o código do país.
 */
function toE164BR(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 11) return null;
  return `+55${digits}`;
}

/**
 * Traduz mensagens comuns da Auth API para PT-BR e evita vazar detalhes internos.
 */
function humanizeAuthError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  const lower = raw.toLowerCase();

  if (lower.includes('invalid phone')) return 'Número de telefone inválido.';
  if (lower.includes('invalid') && lower.includes('code')) return 'Código inválido. Verifique e tente novamente.';
  if (lower.includes('rate limit') || lower.includes('too many')) return 'Muitas tentativas. Aguarde antes de tentar novamente.';
  if (lower.includes('expired')) return 'O código expirou. Solicite um novo.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Falha de rede. Verifique sua conexão e tente novamente.';

  return raw || fallback;
}

export function useMFAPhone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PhoneMFAState>(INITIAL_STATE);

  const enrollPhone = useCallback(async (phoneNumber: string) => {
    const formattedPhone = toE164BR(phoneNumber);
    if (!formattedPhone) {
      const message = 'Número inválido. Informe DDD + 9 dígitos.';
      setState(prev => ({ ...prev, error: message }));
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return { data: null, error: new Error(message) };
    }

    setState(prev => ({ ...prev, isEnrolling: true, error: null }));

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'phone',
        phone: formattedPhone,
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isEnrolling: false,
        phoneNumber: formattedPhone,
        factorId: data?.id ?? null,
      }));

      toast({
        title: 'Código enviado',
        description: `Um código foi enviado para ${formattedPhone}`,
      });

      return { data, error: null };
    } catch (error) {
      const message = humanizeAuthError(error, 'Erro ao configurar SMS MFA');
      setState(prev => ({ ...prev, isEnrolling: false, error: message }));
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return { data: null, error };
    }
  }, [toast]);

  const verifyPhone = useCallback(async (code: string) => {
    if (!state.factorId) {
      toast({
        title: 'Erro',
        description: 'Nenhum fator de SMS configurado',
        variant: 'destructive',
      });
      return { data: null, error: new Error('No factor ID') };
    }

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: state.factorId,
      });
      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: state.factorId,
        challengeId: challenge.id,
        code,
      });
      if (error) throw error;

      setState(prev => ({ ...prev, isVerifying: false }));
      queryClient.invalidateQueries({ queryKey: queryKeys.mfa.all });

      toast({
        title: 'Sucesso',
        description: 'MFA por SMS ativado com sucesso',
      });

      return { data, error: null };
    } catch (error) {
      const message = humanizeAuthError(error, 'Código inválido');
      setState(prev => ({ ...prev, isVerifying: false, error: message }));
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return { data: null, error };
    }
  }, [state.factorId, toast, queryClient]);

  const resendCode = useCallback(async () => {
    if (!state.factorId) return { data: null, error: new Error('No factor ID') };

    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: state.factorId,
      });
      if (error) throw error;

      toast({
        title: 'Código reenviado',
        description: 'Um novo código foi enviado para seu telefone',
      });
      return { data, error: null };
    } catch (error) {
      const message = humanizeAuthError(error, 'Não foi possível reenviar o código');
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return { data: null, error };
    }
  }, [state.factorId, toast]);

  /**
   * Reseta o estado e limpa o fator não verificado no servidor
   * para evitar acúmulo de fatores órfãos na conta.
   */
  const reset = useCallback(async () => {
    const orphanFactorId = state.factorId;
    setState(INITIAL_STATE);
    if (orphanFactorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId: orphanFactorId });
        queryClient.invalidateQueries({ queryKey: queryKeys.mfa.all });
      } catch {
        // best-effort cleanup — silencioso
      }
    }
  }, [state.factorId, queryClient]);

  return {
    ...state,
    enrollPhone,
    verifyPhone,
    resendCode,
    reset,
  };
}
