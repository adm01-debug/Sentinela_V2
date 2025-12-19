import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface WhatsAppSettings {
  id: string;
  phone_number_id: string;
  access_token: string;
  business_account_id: string;
  is_active: boolean;
  webhook_verify_token?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateWhatsAppSettingsInput {
  phone_number_id?: string;
  access_token?: string;
  business_account_id?: string;
  is_active?: boolean;
  webhook_verify_token?: string;
}

// ============================================================
// QUERIES
// ============================================================

export function useWhatsAppSettings() {
  return useQuery({
    queryKey: queryKeys.settings.whatsapp(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as WhatsAppSettings | null;
    },
    ...queryPresets.config,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useUpdateWhatsAppSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateWhatsAppSettingsInput) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('whatsapp_settings')
        .select('id')
        .single();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('whatsapp_settings')
          .update(input)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('whatsapp_settings')
          .insert(input)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return result;
    },
    onSuccess: () => {
      invalidateRelated.settings(queryClient);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do WhatsApp foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTestWhatsAppConnection() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { test: true },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Conexão OK',
        description: 'A conexão com o WhatsApp está funcionando.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na conexão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSendWhatsAppMessage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ to, message, template_name, template_params }: {
      to: string;
      message?: string;
      template_name?: string;
      template_params?: Record<string, string>;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { to, message, template_name, template_params },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Mensagem enviada',
        description: 'A mensagem foi enviada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
