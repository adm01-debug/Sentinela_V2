import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, CACHE_TIMES } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  company_id?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    members: number;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TeamMember {
  id: string;
  team_id: string;
  employee_id: string;
  role: 'member' | 'lead';
  joined_at: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  manager_id?: string;
  color?: string;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      manager:employees!teams_manager_id_fkey(id, name, email)
    `)
    .order('name');

  if (error) throw error;

  // Get member counts
  const teamsWithCounts = await Promise.all(
    (data || []).map(async (team) => {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id);

      return {
        ...team,
        _count: { members: count || 0 },
      };
    })
  );

  return teamsWithCounts;
}

async function fetchTeam(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      manager:employees!teams_manager_id_fkey(id, name, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      employee:employees(id, name, email, avatar_url)
    `)
    .eq('team_id', teamId)
    .order('joined_at');

  if (error) throw error;
  return data || [];
}

// ============================================================
// HOOKS - QUERIES
// ============================================================

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams.lists(),
    queryFn: fetchTeams,
    ...queryPresets.list,
  });
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id!),
    queryFn: () => fetchTeam(id!),
    enabled: !!id,
    staleTime: CACHE_TIMES.STABLE,
  });
}

export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => fetchTeamMembers(teamId!),
    enabled: !!teamId,
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

// ============================================================
// HOOKS - MUTATIONS
// ============================================================

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast({
        title: 'Equipe criada',
        description: 'A equipe foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar equipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(data.id) });
      toast({
        title: 'Equipe atualizada',
        description: 'As informações da equipe foram atualizadas.',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast({
        title: 'Equipe excluída',
        description: 'A equipe foi excluída com sucesso.',
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

// ============================================================
// HOOKS - TEAM MEMBERS
// ============================================================

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teamId, employeeId, role = 'member' }: { 
      teamId: string; 
      employeeId: string; 
      role?: 'member' | 'lead';
    }) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          employee_id: employeeId,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast({
        title: 'Membro adicionado',
        description: 'O funcionário foi adicionado à equipe.',
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
    mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      return { teamId, memberId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast({
        title: 'Membro removido',
        description: 'O funcionário foi removido da equipe.',
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
