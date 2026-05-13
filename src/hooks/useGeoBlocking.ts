import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface GeoBlock {
  id: string;
  country_code: string;
  country_name: string;
  region: string | null;
  block_type: string;
  is_active: boolean;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface GeoBlockingSettings {
  id: string;
  enabled: boolean;
  mode: 'whitelist' | 'blocklist';
  block_vpn: boolean;
  block_proxy: boolean;
  block_tor: boolean;
  log_blocked_attempts: boolean;
}

// Lista de países com códigos ISO
export const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'França' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'IT', name: 'Itália' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'EC', name: 'Equador' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'JP', name: 'Japão' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'IN', name: 'Índia' },
  { code: 'AU', name: 'Austrália' },
  { code: 'NZ', name: 'Nova Zelândia' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'RU', name: 'Rússia' },
  { code: 'NL', name: 'Holanda' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'CH', name: 'Suíça' },
  { code: 'AT', name: 'Áustria' },
  { code: 'PL', name: 'Polônia' },
  { code: 'SE', name: 'Suécia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlândia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'Emirados Árabes' },
  { code: 'SG', name: 'Singapura' },
].sort((a, b) => a.name.localeCompare(b.name));

export function useGeoBlocking() {
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['geo-blocking-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_blocking_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as GeoBlockingSettings | null;
    },
  });

  // Fetch allowed/blocked countries
  const { data: geoBlocks = [], isLoading: blocksLoading, refetch } = useQuery({
    queryKey: ['geo-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_blocks')
        .select('*')
        .order('country_name', { ascending: true });
      
      if (error) throw error;
      return data as GeoBlock[];
    },
  });

  // Update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<GeoBlockingSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('geo_blocking_settings')
          .update({ ...newSettings, updated_at: new Date().toISOString() })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('geo_blocking_settings')
          .insert([newSettings]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-blocking-settings'] });
      toast.success('Configurações atualizadas');
    },
    onError: (error) => {
      logger.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    },
  });

  // Add country to whitelist
  const addCountryMutation = useMutation({
    mutationFn: async ({ countryCode, countryName, reason }: { countryCode: string; countryName: string; reason?: string }) => {
      const { error } = await supabase
        .from('geo_blocks')
        .insert([{
          country_code: countryCode,
          country_name: countryName,
          block_type: 'allow', // whitelist mode
          is_active: true,
          reason: reason || 'Adicionado à whitelist',
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-blocks'] });
      toast.success('País adicionado à whitelist');
    },
    onError: (error: Error & { code?: string }) => {
      logger.error('Error adding country:', error);
      if (error?.code === '23505') {
        toast.error('País já está na lista');
      } else {
        toast.error('Erro ao adicionar país');
      }
    },
  });

  // Remove country from whitelist
  const removeCountryMutation = useMutation({
    mutationFn: async (id: any) => {
      const { error } = await supabase
        .from('geo_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-blocks'] });
      toast.success('País removido da whitelist');
    },
    onError: (error) => {
      logger.error('Error removing country:', error);
      toast.error('Erro ao remover país');
    },
  });

  // Toggle country active status
  const toggleCountryMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('geo_blocks')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-blocks'] });
      toast.success('Status atualizado');
    },
    onError: (error) => {
      logger.error('Error toggling country:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  // Get whitelisted countries (block_type = 'allow')
  const whitelistedCountries = geoBlocks.filter(b => b.block_type === 'allow' && b.is_active);
  const availableCountries = COUNTRIES.filter(
    c => !geoBlocks.some(b => b.country_code === c.code && b.block_type === 'allow')
  );

  return {
    settings,
    geoBlocks,
    whitelistedCountries,
    availableCountries,
    isLoading: settingsLoading || blocksLoading,
    updateSettings: updateSettingsMutation.mutate,
    addCountry: addCountryMutation.mutate,
    removeCountry: removeCountryMutation.mutate,
    toggleCountry: toggleCountryMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    isAdding: addCountryMutation.isPending,
    isRemoving: removeCountryMutation.isPending,
    refetch,
  };
}
