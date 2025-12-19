import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, CACHE_TIMES } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'office' | 'restricted' | 'allowed' | 'custom';
  is_active: boolean;
  company_id?: string;
  address?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface GeofenceEvent {
  id: string;
  geofence_id: string;
  employee_id: string;
  event_type: 'enter' | 'exit';
  timestamp: string;
  latitude: number;
  longitude: number;
  geofence?: Geofence;
  employee?: {
    id: string;
    name: string;
  };
}

export interface CreateGeofenceInput {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  type?: 'office' | 'restricted' | 'allowed' | 'custom';
  address?: string;
  color?: string;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchGeofences(): Promise<Geofence[]> {
  const { data, error } = await supabase
    .from('geofences')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

async function fetchGeofence(id: string): Promise<Geofence | null> {
  const { data, error } = await supabase
    .from('geofences')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function fetchGeofenceEvents(
  geofenceId?: string,
  limit = 50
): Promise<GeofenceEvent[]> {
  let query = supabase
    .from('geofence_events')
    .select(`
      *,
      geofence:geofences(id, name, type),
      employee:employees(id, name)
    `)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (geofenceId) {
    query = query.eq('geofence_id', geofenceId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// ============================================================
// HOOKS - QUERIES
// ============================================================

export function useGeofences() {
  return useQuery({
    queryKey: queryKeys.geofences.lists(),
    queryFn: fetchGeofences,
    ...queryPresets.list,
  });
}

export function useGeofence(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.geofences.detail(id!),
    queryFn: () => fetchGeofence(id!),
    enabled: !!id,
    staleTime: CACHE_TIMES.STABLE,
  });
}

export function useGeofenceEvents(geofenceId?: string) {
  return useQuery({
    queryKey: ['geofences', geofenceId || 'all', 'events'],
    queryFn: () => fetchGeofenceEvents(geofenceId),
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

export function useActiveGeofences() {
  return useQuery({
    queryKey: ['geofences', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STABLE,
  });
}

// ============================================================
// HOOKS - MUTATIONS
// ============================================================

export function useCreateGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateGeofenceInput) => {
      const { data, error } = await supabase
        .from('geofences')
        .insert({
          ...input,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      toast({
        title: 'Geofence criado',
        description: 'A cerca geográfica foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar geofence',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Geofence> & { id: string }) => {
      const { data, error } = await supabase
        .from('geofences')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.detail(data.id) });
      toast({
        title: 'Geofence atualizado',
        description: 'As informações foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('geofences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      toast({
        title: 'Geofence excluído',
        description: 'A cerca geográfica foi excluída.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('geofences')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      toast({
        title: data.is_active ? 'Geofence ativado' : 'Geofence desativado',
        description: `A cerca "${data.name}" foi ${data.is_active ? 'ativada' : 'desativada'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
