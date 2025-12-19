import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: 'circle' | 'polygon';
  coordinates: number[][];
  radius?: number;
  is_active: boolean;
  alert_on_enter: boolean;
  alert_on_exit: boolean;
  applies_to: 'all' | 'teams' | 'employees';
  target_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateGeofenceInput {
  name: string;
  description?: string;
  type: 'circle' | 'polygon';
  coordinates: number[][];
  radius?: number;
  is_active?: boolean;
  alert_on_enter?: boolean;
  alert_on_exit?: boolean;
  applies_to?: 'all' | 'teams' | 'employees';
  target_ids?: string[];
}

export interface UpdateGeofenceInput {
  id: string;
  name?: string;
  description?: string;
  coordinates?: number[][];
  radius?: number;
  is_active?: boolean;
  alert_on_enter?: boolean;
  alert_on_exit?: boolean;
  applies_to?: 'all' | 'teams' | 'employees';
  target_ids?: string[];
}

// ============================================================
// QUERIES
// ============================================================

export function useGeofences() {
  return useQuery({
    queryKey: queryKeys.geofences.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Geofence[];
    },
    ...queryPresets.list,
  });
}

export function useActiveGeofences() {
  return useQuery({
    queryKey: queryKeys.geofences.active(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as Geofence[];
    },
    ...queryPresets.config,
  });
}

export function useGeofence(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.geofences.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Geofence;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

// ============================================================
// MUTATIONS WITH OPTIMISTIC UPDATES
// ============================================================

export function useCreateGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateGeofenceInput) => {
      const { data, error } = await supabase
        .from('geofences')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Geofence;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.geofences.lists() });

      const previousGeofences = queryClient.getQueryData<Geofence[]>(queryKeys.geofences.lists());

      const optimisticGeofence: Geofence = {
        id: `temp-${Date.now()}`,
        name: input.name,
        description: input.description,
        type: input.type,
        coordinates: input.coordinates,
        radius: input.radius,
        is_active: input.is_active ?? true,
        alert_on_enter: input.alert_on_enter ?? true,
        alert_on_exit: input.alert_on_exit ?? true,
        applies_to: input.applies_to ?? 'all',
        target_ids: input.target_ids,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Geofence[]>(
        queryKeys.geofences.lists(),
        (old) => [...(old || []), optimisticGeofence]
      );

      return { previousGeofences };
    },
    onError: (err, _, context) => {
      if (context?.previousGeofences) {
        queryClient.setQueryData(queryKeys.geofences.lists(), context.previousGeofences);
      }
      toast({
        title: 'Erro ao criar geofence',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      invalidateRelated.geofences(queryClient);
      toast({
        title: 'Geofence criada',
        description: 'A geofence foi criada com sucesso.',
      });
    },
  });
}

export function useUpdateGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateGeofenceInput) => {
      const { data, error } = await supabase
        .from('geofences')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Geofence;
    },
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.geofences.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.geofences.detail(id) });

      const previousGeofences = queryClient.getQueryData<Geofence[]>(queryKeys.geofences.lists());
      const previousGeofence = queryClient.getQueryData<Geofence>(queryKeys.geofences.detail(id));

      queryClient.setQueryData<Geofence[]>(
        queryKeys.geofences.lists(),
        (old) => old?.map(g => g.id === id ? { ...g, ...input, updated_at: new Date().toISOString() } : g) || []
      );

      if (previousGeofence) {
        queryClient.setQueryData<Geofence>(
          queryKeys.geofences.detail(id),
          { ...previousGeofence, ...input, updated_at: new Date().toISOString() }
        );
      }

      return { previousGeofences, previousGeofence, id };
    },
    onError: (err, _, context) => {
      if (context?.previousGeofences) {
        queryClient.setQueryData(queryKeys.geofences.lists(), context.previousGeofences);
      }
      if (context?.previousGeofence && context?.id) {
        queryClient.setQueryData(queryKeys.geofences.detail(context.id), context.previousGeofence);
      }
      toast({
        title: 'Erro ao atualizar geofence',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      invalidateRelated.geofences(queryClient);
      toast({
        title: 'Geofence atualizada',
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.geofences.lists() });

      const previousGeofences = queryClient.getQueryData<Geofence[]>(queryKeys.geofences.lists());

      queryClient.setQueryData<Geofence[]>(
        queryKeys.geofences.lists(),
        (old) => old?.filter(g => g.id !== id) || []
      );

      return { previousGeofences, id };
    },
    onError: (err, _, context) => {
      if (context?.previousGeofences) {
        queryClient.setQueryData(queryKeys.geofences.lists(), context.previousGeofences);
      }
      toast({
        title: 'Erro ao excluir geofence',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.geofences.detail(id) });
      invalidateRelated.geofences(queryClient);
      toast({
        title: 'Geofence excluída',
      });
    },
  });
}

export function useToggleGeofence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('geofences')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Geofence;
    },
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.geofences.lists() });

      const previousGeofences = queryClient.getQueryData<Geofence[]>(queryKeys.geofences.lists());

      queryClient.setQueryData<Geofence[]>(
        queryKeys.geofences.lists(),
        (old) => old?.map(g => g.id === id ? { ...g, is_active } : g) || []
      );

      return { previousGeofences };
    },
    onError: (err, _, context) => {
      if (context?.previousGeofences) {
        queryClient.setQueryData(queryKeys.geofences.lists(), context.previousGeofences);
      }
      toast({
        title: 'Erro ao alterar status',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      invalidateRelated.geofences(queryClient);
      toast({
        title: data.is_active ? 'Geofence ativada' : 'Geofence desativada',
      });
    },
  });
}
