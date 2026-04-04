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

export function useMFAPhone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PhoneMFAState>({
    isEnrolling: false,
    isVerifying: false,
    phoneNumber: '',
    factorId: null,
    error: null,
  });

  const enrollPhone = useCallback(async (phoneNumber) => {
    setState(prev => ({ ...prev, isEnrolling: true, error: null }));

    try {
      // Format phone number to E.164 format
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+55${phoneNumber.replace(/\D/g, '')}`;

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'phone',
        phone: formattedPhone,
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isEnrolling: false,
        phoneNumber: formattedPhone,
        factorId: data?.id || null,
      }));

      toast({
        title: 'Código enviado',
        description: `Um código foi enviado para ${formattedPhone}`,
      });

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao configurar SMS MFA';
      setState(prev => ({ ...prev, isEnrolling: false, error: message }));
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  }, [toast]);

  const verifyPhone = useCallback(async (code) => {
    if (!state.factorId) {
      toast({
        title: 'Erro',
        description: 'Nenhum fator de SMS configurado',
        variant: 'destructive',
      });
      return { error: new Error('No factor ID') };
    }

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      // First create a challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: state.factorId,
      });

      if (challengeError) throw challengeError;

      // Then verify the code
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
      const message = error instanceof Error ? error.message : 'Código inválido';
      setState(prev => ({ ...prev, isVerifying: false, error: message }));
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  }, [state.factorId, toast, queryClient]);

  const resendCode = useCallback(async () => {
    if (!state.factorId) return;

    try {
      const { error } = await supabase.auth.mfa.challenge({
        factorId: state.factorId,
      });

      if (error) throw error;

      toast({
        title: 'Código reenviado',
        description: 'Um novo código foi enviado para seu telefone',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível reenviar o código',
        variant: 'destructive',
      });
    }
  }, [state.factorId, toast]);

  const reset = useCallback(() => {
    setState({
      isEnrolling: false,
      isVerifying: false,
      phoneNumber: '',
      factorId: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    enrollPhone,
    verifyPhone,
    resendCode,
    reset,
  };
}
