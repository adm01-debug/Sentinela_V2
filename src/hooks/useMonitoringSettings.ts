import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MonitoringSettings {
  keystroke_monitoring: {
    enabled: boolean;
    interval_seconds: number;
  };
  productivity_tracking: {
    enabled: boolean;
    work_hours_start: string;
    work_hours_end: string;
  };
  screen_capture: {
    enabled: boolean;
    interval_minutes: number;
    blur_sensitive: boolean;
  };
  monitoring_notice: {
    show_notice: boolean;
    notice_text: string;
  };
}

const defaultSettings: MonitoringSettings = {
  keystroke_monitoring: { enabled: true, interval_seconds: 60 },
  productivity_tracking: { enabled: true, work_hours_start: '09:00', work_hours_end: '18:00' },
  screen_capture: { enabled: true, interval_minutes: 5, blur_sensitive: true },
  monitoring_notice: { show_notice: true, notice_text: 'Este dispositivo está sendo monitorado para fins de segurança corporativa.' }
};

export function useMonitoringSettings() {
  const [settings, setSettings] = useState<MonitoringSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      if (data) {
        const newSettings = { ...defaultSettings };
        data.forEach((row) => {
          const key = row.setting_key as keyof MonitoringSettings;
          if (key in newSettings) {
            (newSettings as any)[key] = row.setting_value;
          }
        });
        setSettings(newSettings);
      }
    } catch (error: any) {
      console.error('Error fetching monitoring settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof MonitoringSettings>(
    key: K,
    value: MonitoringSettings[K]
  ) => {
    try {
      const { error } = await supabase
        .from('monitoring_settings')
        .update({ setting_value: value as any })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Configuração atualizada');
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  return { settings, loading, updateSetting, refetch: fetchSettings };
}
