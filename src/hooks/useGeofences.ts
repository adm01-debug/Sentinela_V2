import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { geofenceService } from '@/services/geofenceService';
import type {
  CreateGeofenceInput,
  Geofence,
  UpdateGeofenceInput,
} from '@/services/geofenceService';

// ============================================================
// TYPES
// ============================================================

export type { Geofence, CreateGeofenceInput, UpdateGeofenceInput };

// ============================================================
// QUERIES
// ============================================================

export function useGeofences() {
  return useQuery({
    queryKey: queryKeys.geofences.lists(),
    queryFn: () => geofenceService.getGeofences(),
    ...queryPresets.list,
  });
}

export function useActiveGeofences() {
  return useQuery({
    queryKey: queryKeys.geofences.active(),
    queryFn: () => geofenceService.getActiveGeofences(),
    ...queryPresets.config,
  });
}

export function useGeofence(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.geofences.detail(id || ''),
    queryFn: () => geofenceService.getGeofenceById(id || ''),
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
    mutationFn: (input: CreateGeofenceInput) => geofenceService.createGeofence(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.geofences.lists() });

      const previousGeofences = queryClient.getQueryData<Geofence[]>(queryKeys.geofences.lists());

      const optimisticGeofence: Geofence = {
        id: `temp-${Date.now()}`,
        name: input.name,
        description: input.description ?? null,
        address: input.address ?? null,
        color: input.color ?? null,
        type: input.type ?? 'circle',
        geometry: input.geometry ?? null,
        latitude: input.latitude,
        longitude: input.longitude,
        radius_meters: input.radius_meters ?? 100,
        is_active: input.is_active ?? true,
        restricted: input.restricted ?? false,
        required: input.required ?? false,
        company_id: input.company_id ?? null,
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
    mutationFn: ({ id, ...input }: UpdateGeofenceInput) => geofenceService.updateGeofence(id, input),
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
    mutationFn: (id: string) => geofenceService.deleteGeofence(id),
    onMutate: async (id: string) => {
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
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => geofenceService.toggleGeofence(id, is_active),
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
    onSuccess: (data: Geofence) => {
      invalidateRelated.geofences(queryClient);
      toast({
        title: data.is_active ? 'Geofence ativada' : 'Geofence desativada',
      });
    },
  });
}
