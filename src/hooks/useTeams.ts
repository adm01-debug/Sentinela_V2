import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  leader_id: string | null;
  leader_name: string | null;
  parent_team_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  employee_name: string;
  role: string | null;
  joined_at: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  parent_team?: Team | null;
  child_teams?: Team[];
}

export function useTeams() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      // Fetch all team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*');

      if (membersError) throw membersError;

      // Combine teams with their members
      const teamsWithMembers: TeamWithMembers[] = (teamsData || []).map(team => ({
        ...team,
        members: (membersData || []).filter(m => m.team_id === team.id),
        parent_team: teamsData?.find(t => t.id === team.parent_team_id) || null,
        child_teams: teamsData?.filter(t => t.parent_team_id === team.id) || []
      }));

      setTeams(teamsWithMembers);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast.error('Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (team: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...team,
          created_by: userData.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Equipe criada com sucesso');
      await fetchTeams();
      return data;
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error('Erro ao criar equipe');
      throw error;
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Equipe atualizada com sucesso');
      await fetchTeams();
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast.error('Erro ao atualizar equipe');
      throw error;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Equipe excluída com sucesso');
      await fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error('Erro ao excluir equipe');
      throw error;
    }
  };

  const addMember = async (teamId: string, employeeName: string, role: string = 'member') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          employee_name: employeeName,
          role
        });

      if (error) throw error;

      toast.success('Membro adicionado com sucesso');
      await fetchTeams();
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error('Erro ao adicionar membro');
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Membro removido com sucesso');
      await fetchTeams();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Função atualizada com sucesso');
      await fetchTeams();
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast.error('Erro ao atualizar função');
      throw error;
    }
  };

  return {
    teams,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    updateMemberRole,
    refetch: fetchTeams
  };
}
