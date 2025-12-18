import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AlertNotificationSettings {
  id: string;
  setting_type: string;
  recipient_emails: string[];
  notify_critical: boolean;
  notify_high: boolean;
  notify_medium: boolean;
  notify_low: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useAlertSettings() {
  const [settings, setSettings] = useState<AlertNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_notification_settings')
        .select('*')
        .eq('setting_type', 'violation_alerts')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data as AlertNotificationSettings);
    } catch (error: any) {
      console.error('Error fetching alert settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updates: Partial<AlertNotificationSettings>) => {
    try {
      if (settings?.id) {
        const { error } = await supabase
          .from('alert_notification_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alert_notification_settings')
          .insert({
            setting_type: 'violation_alerts',
            ...updates
          });

        if (error) throw error;
      }

      await fetchSettings();
      toast.success('Configurações salvas');
      return true;
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
      return false;
    }
  };

  const addEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      toast.error('Email inválido');
      return false;
    }

    const currentEmails = settings?.recipient_emails || [];
    if (currentEmails.includes(email)) {
      toast.error('Email já adicionado');
      return false;
    }

    return updateSettings({
      recipient_emails: [...currentEmails, email]
    });
  };

  const removeEmail = async (email: string) => {
    const currentEmails = settings?.recipient_emails || [];
    return updateSettings({
      recipient_emails: currentEmails.filter(e => e !== email)
    });
  };

  const testNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Teste de Notificação',
          body: 'Esta é uma notificação de teste do sistema SecureWatch.',
          severity: 'high',
          data: {
            employee_name: 'Sistema',
            device: 'Teste',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      toast.success('Notificação de teste enviada!');
    } catch (error: any) {
      toast.error('Erro ao enviar teste: ' + error.message);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    addEmail,
    removeEmail,
    testNotification,
    refetch: fetchSettings
  };
}
