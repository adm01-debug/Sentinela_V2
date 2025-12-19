import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WhatsAppSettings {
  id: string;
  enabled: boolean;
  phone_number_id: string | null;
  recipient_numbers: string[];
  notify_critical: boolean;
  notify_high: boolean;
  notify_medium: boolean;
  notify_low: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessageLog {
  id: string;
  recipient_number: string;
  message_type: string;
  message_content: string;
  status: string;
  whatsapp_message_id: string | null;
  error_message: string | null;
  violation_id: string | null;
  created_at: string;
}

export function useWhatsAppSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: async (): Promise<WhatsAppSettings | null> => {
      const { data, error } = await supabase
        .from('whatsapp_notification_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as WhatsAppSettings | null;
    },
  });

  const { data: messageLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['whatsapp-message-logs'],
    queryFn: async (): Promise<WhatsAppMessageLog[]> => {
      const { data, error } = await supabase
        .from('whatsapp_message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as WhatsAppMessageLog[];
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Partial<WhatsAppSettings>) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (settings?.id) {
        const { data, error } = await supabase
          .from('whatsapp_notification_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('whatsapp_notification_settings')
          .insert({
            ...newSettings,
            created_by: user?.user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-settings'] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do WhatsApp foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const sendTestMessage = useMutation({
    mutationFn: async (recipientNumber: string) => {
      if (!settings?.phone_number_id) {
        throw new Error('Phone Number ID não configurado');
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          recipient_number: recipientNumber,
          message: '🔔 Mensagem de teste do Sistema de Monitoramento. Se você recebeu esta mensagem, a integração está funcionando corretamente!',
          message_type: 'test',
          phone_number_id: settings.phone_number_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-message-logs'] });
      toast({
        title: 'Mensagem enviada',
        description: 'Mensagem de teste enviada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar mensagem: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const sendViolationAlert = useMutation({
    mutationFn: async (params: {
      violation: {
        id: string;
        employee_name: string;
        violation_type: string;
        severity: string;
        description: string | null;
        created_at: string;
      };
    }) => {
      if (!settings?.enabled || !settings?.phone_number_id) {
        throw new Error('WhatsApp não está habilitado ou configurado');
      }

      const { violation } = params;
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }[violation.severity] || '⚪';

      const message = `${severityEmoji} *ALERTA DE VIOLAÇÃO*

👤 Funcionário: ${violation.employee_name}
📋 Tipo: ${violation.violation_type}
⚠️ Severidade: ${violation.severity.toUpperCase()}
📝 Descrição: ${violation.description || 'N/A'}
🕐 Data/Hora: ${new Date(violation.created_at).toLocaleString('pt-BR')}

---
Sistema de Monitoramento`;

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          recipient_numbers: settings.recipient_numbers,
          message,
          message_type: 'violation_alert',
          violation_id: violation.id,
          phone_number_id: settings.phone_number_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-message-logs'] });
    },
    onError: (error) => {
      console.error('Error sending WhatsApp violation alert:', error);
    },
  });

  return {
    settings,
    isLoading,
    messageLogs,
    logsLoading,
    saveSettings,
    sendTestMessage,
    sendViolationAlert,
  };
}
