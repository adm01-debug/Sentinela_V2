import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: 'totp' | 'phone';
  status: 'unverified' | 'verified';
  created_at: string;
  updated_at: string;
}

type QueryPreset = { staleTime?: number; gcTime?: number; refetchOnWindowFocus?: boolean };
const presetConfig = (queryPresets as { config?: QueryPreset }).config ?? {};

/**
 * Humaniza mensagens de erro da Auth API para PT-BR,
 * evitando expor stack traces ou mensagens em inglês ao usuário final.
 */
function humanizeMFAError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid') && normalized.includes('code')) {
    return 'Código inválido. Verifique e tente novamente.';
  }
  if (normalized.includes('expired')) {
    return 'Código expirado. Solicite um novo.';
  }
  if (normalized.includes('rate') || normalized.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }
  if (normalized.includes('already') && normalized.includes('enroll')) {
    return 'Este fator já está cadastrado na sua conta.';
  }
  return message || fallback;
}

export function useMFAFactors() {
  return useQuery({
    queryKey: queryKeys.mfa.factors(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data.totp as MFAFactor[];
    },
    ...presetConfig,
  });
}

export function useMFAStatus() {
  return useQuery({
    queryKey: queryKeys.mfa.status(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      return {
        currentLevel: data.currentLevel,
        nextLevel: data.nextLevel,
        currentAuthenticationMethods: data.currentAuthenticationMethods,
      };
    },
    ...presetConfig,
  });
}

export function useEnrollMFA() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (friendlyName?: string) => {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mfa.factors() });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao configurar MFA',
        description: humanizeMFAError(error, 'Não foi possível iniciar o cadastro do fator.'),
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyMFA() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ factorId, code }: { factorId: string; code: string }) => {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mfa.all });
      toast({ title: 'MFA verificado com sucesso' });
    },
    onError: (error) => {
      toast({
        title: 'Código inválido',
        description: humanizeMFAError(error, 'Não foi possível verificar o código.'),
        variant: 'destructive',
      });
    },
  });
}

export function useUnenrollMFA() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (factorId: string) => {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mfa.all });
      toast({ title: 'MFA desativado' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao desativar MFA',
        description: humanizeMFAError(error, 'Não foi possível remover o fator.'),
        variant: 'destructive',
      });
    },
  });
}

// Combined hook for MFA management
export function useMFA() {
  const queryClient = useQueryClient();
  const factorsQuery = useMFAFactors();
  const statusQuery = useMFAStatus();
  const enrollMutation = useEnrollMFA();
  const verifyMutation = useVerifyMFA();
  const unenrollMutation = useUnenrollMFA();

  const factors: MFAFactor[] = Array.isArray(factorsQuery.data) ? factorsQuery.data : [];
  const isEnrolled = factors.some((f) => f.status === 'verified');

  return {
    isEnrolled,
    factors,
    status: statusQuery.data,
    loading: factorsQuery.isLoading || statusQuery.isLoading,
    error: factorsQuery.error || statusQuery.error,

    enroll: async (friendlyName?: string) => {
      try {
        const data = await enrollMutation.mutateAsync(friendlyName);
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },

    verify: async (factorId: string, code: string) => {
      try {
        const data = await verifyMutation.mutateAsync({ factorId, code });
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },

    unenroll: async (factorId: string) => {
      try {
        await unenrollMutation.mutateAsync(factorId);
        return { error: null };
      } catch (error) {
        return { error: error as Error };
      }
    },

    checkMFAStatus: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mfa.all });
    },
  };
}
