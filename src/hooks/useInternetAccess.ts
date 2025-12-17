import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AccessLevel = 'restricted' | 'partial' | 'full';

export interface InternetAccessSetting {
  id: string;
  employee_name: string;
  access_level: AccessLevel;
  allowed_sites: string[];
  blocked_sites: string[];
  allowed_categories: string[];
  blocked_categories: string[];
  bandwidth_limit_mbps: number | null;
  active_hours_start: string | null;
  active_hours_end: string | null;
  notes: string | null;
  updated_at: string;
}

export function useInternetAccess() {
  const [settings, setSettings] = useState<InternetAccessSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('internet_access_settings')
        .select('*')
        .order('employee_name');

      if (error) throw error;
      setSettings(data as InternetAccessSetting[]);
    } catch (error: any) {
      toast.error('Erro ao carregar configurações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeSetting = (employeeName: string) => {
    return settings.find(s => s.employee_name === employeeName);
  };

  const updateSetting = async (employeeName: string, updates: Partial<InternetAccessSetting>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('internet_access_settings')
        .upsert({
          employee_name: employeeName,
          ...updates,
          updated_by: user?.id
        }, { onConflict: 'employee_name' });

      if (error) throw error;

      await fetchSettings();
      toast.success('Configurações atualizadas');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
      return false;
    }
  };

  const setAccessLevel = async (employeeName: string, level: AccessLevel) => {
    return updateSetting(employeeName, { access_level: level });
  };

  const addAllowedSite = async (employeeName: string, site: string) => {
    const current = getEmployeeSetting(employeeName);
    const allowedSites = [...(current?.allowed_sites || []), site];
    return updateSetting(employeeName, { allowed_sites: allowedSites });
  };

  const removeAllowedSite = async (employeeName: string, site: string) => {
    const current = getEmployeeSetting(employeeName);
    const allowedSites = (current?.allowed_sites || []).filter(s => s !== site);
    return updateSetting(employeeName, { allowed_sites: allowedSites });
  };

  const addBlockedSite = async (employeeName: string, site: string) => {
    const current = getEmployeeSetting(employeeName);
    const blockedSites = [...(current?.blocked_sites || []), site];
    return updateSetting(employeeName, { blocked_sites: blockedSites });
  };

  const removeBlockedSite = async (employeeName: string, site: string) => {
    const current = getEmployeeSetting(employeeName);
    const blockedSites = (current?.blocked_sites || []).filter(s => s !== site);
    return updateSetting(employeeName, { blocked_sites: blockedSites });
  };

  const deleteSetting = async (employeeName: string) => {
    try {
      const { error } = await supabase
        .from('internet_access_settings')
        .delete()
        .eq('employee_name', employeeName);

      if (error) throw error;

      setSettings(prev => prev.filter(s => s.employee_name !== employeeName));
      toast.success('Configuração removida');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover: ' + error.message);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    setAccessLevel,
    addAllowedSite,
    removeAllowedSite,
    addBlockedSite,
    removeBlockedSite,
    deleteSetting,
    getEmployeeSetting,
    refetch: fetchSettings
  };
}
