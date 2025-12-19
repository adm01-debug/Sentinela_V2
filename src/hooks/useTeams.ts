import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated, CACHE_TIMES } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  member_count?: number;
  created_at: string;
  updated_at: string;
  leader?: {
    id: string;
    full_name: string;
  };
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  leader_id?: string;
}

export interface UpdateTeamInput {
  id: string;
  name?: string;
  description?: string;
  leader_id?: string;
}

// ============================================================
// QUERIES
// ============================================================

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader:employees!teams_leader_id_fkey(id, full_name)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Team[];
    },
    staleTime: CACHE_TIMES.STABLE,
    gcTime: CACHE_TIMES.STATIC,
  });
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader:employees!teams_leader_id_fkey(id, full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Team;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

// ============================================================
// MUTATIONS WITH OPTIMISTIC UPDATES
// ============================================================

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(input)
        .select(`*, leader:employees!teams_leader_id_fkey(id, full_name)`)
        .single();

      if (error) throw error;
      return data as Team;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.teams.lists() });

      const previousTeams = queryClient.getQueryData<Team[]>(queryKeys.teams.lists());

      const optimisticTeam: Team = {
        id: `temp-${Date.now()}`,
        name: input.name,
        description: input.description,
        leader_id: input.leader_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Team[]>(
        queryKeys.teams.lists(),
        (old) => [...(old || []), optimisticTeam]
      );

      return { previousTeams };
    },
    onError: (err, _, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(queryKeys.teams.lists(), context.previousTeams);
      }
      toast({
        title: 'Erro ao criar equipe',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      invalidateRelated.teams(queryClient);
      toast({
        title: 'Equipe criada',
        description: 'A equipe foi criada com sucesso.',
      });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTeamInput) => {
      const { data, error } = await supabase
        .from('teams')
        .update(input)
        .eq('id', id)
        .select(`*, leader:employees!teams_leader_id_fkey(id, full_name)`)
        .single();

      if (error) throw error;
      return data as Team;
    },
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.teams.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.teams.detail(id) });

      const previousTeams = queryClient.getQueryData<Team[]>(queryKeys.teams.lists());
      const previousTeam = queryClient.getQueryData<Team>(queryKeys.teams.detail(id));

      // Update list
      queryClient.setQueryData<Team[]>(
        queryKeys.teams.lists(),
        (old) => old?.map(t => t.id === id ? { ...t, ...input, updated_at: new Date().toISOString() } : t) || []
      );

      // Update detail
      if (previousTeam) {
        queryClient.setQueryData<Team>(
          queryKeys.teams.detail(id),
          { ...previousTeam, ...input, updated_at: new Date().toISOString() }
        );
      }

      return { previousTeams, previousTeam, id };
    },
    onError: (err, _, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(queryKeys.teams.lists(), context.previousTeams);
      }
      if (context?.previousTeam && context?.id) {
        queryClient.setQueryData(queryKeys.teams.detail(context.id), context.previousTeam);
      }
      toast({
        title: 'Erro ao atualizar equipe',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      invalidateRelated.teams(queryClient);
      toast({
        title: 'Equipe atualizada',
        description: 'A equipe foi atualizada com sucesso.',
      });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.teams.lists() });

      const previousTeams = queryClient.getQueryData<Team[]>(queryKeys.teams.lists());

      queryClient.setQueryData<Team[]>(
        queryKeys.teams.lists(),
        (old) => old?.filter(t => t.id !== id) || []
      );

      return { previousTeams, id };
    },
    onError: (err, _, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(queryKeys.teams.lists(), context.previousTeams);
      }
      toast({
        title: 'Erro ao excluir equipe',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.teams.detail(id) });
      invalidateRelated.teams(queryClient);
      toast({
        title: 'Equipe excluída',
        description: 'A equipe foi excluída com sucesso.',
      });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teamId, employeeId }: { teamId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('employees')
        .update({ team_id: teamId })
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.teams(queryClient);
      invalidateRelated.employees(queryClient);
      toast({
        title: 'Membro adicionado',
        description: 'O membro foi adicionado à equipe.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar membro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from('employees')
        .update({ team_id: null })
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.teams(queryClient);
      invalidateRelated.employees(queryClient);
      toast({
        title: 'Membro removido',
        description: 'O membro foi removido da equipe.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover membro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
