import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: 'totp';
  status: 'unverified' | 'verified';
  created_at: string;
  updated_at: string;
}

export function useMFAFactors() {
  return useQuery({
    queryKey: queryKeys.mfa.factors(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data.totp as MFAFactor[];
    },
    ...queryPresets.config,
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
    ...queryPresets.config,
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
      toast({ title: 'Erro ao configurar MFA', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Código inválido', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Erro ao desativar MFA', description: error.message, variant: 'destructive' });
    },
  });
}
