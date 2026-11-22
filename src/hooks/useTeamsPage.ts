import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  leader_id?: string | null;
  leader_name?: string | null;
  parent_team_id?: string | null;
  created_at: string;
  updated_at: string;
  members_count: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  employee_name: string;
  role: string | null;
  joined_at: string;
}

export interface TeamFormData {
  name: string;
  description: string;
  parent_team_id?: string;
}

const initialFormData: TeamFormData = {
  name: '',
  description: '',
  parent_team_id: undefined,
};

export function useTeamsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []).map((row) => ({
        ...(row as Team),
        members_count: 0,
      })) as Team[];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', selectedTeam.id);
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!selectedTeam,
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const { error } = await supabase.from('teams').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Equipe criada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeamFormData }) => {
      const { error } = await supabase.from('teams').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Equipe atualizada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Equipe excluida!' });
      setIsDeleteDialogOpen(false);
      setDeletingTeam(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = !searchTerm || 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const hasMembers = (team.members_count ?? 0) > 0;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && hasMembers) ||
        (statusFilter === 'inactive' && !hasMembers);
      return matchesSearch && matchesStatus;
    });
  }, [teams, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: teams.length,
    active: teams.filter(t => (t.members_count ?? 0) > 0).length,
    totalMembers: teams.reduce((sum, t) => sum + (t.members_count ?? 0), 0),
    withManager: teams.filter(t => t.leader_id).length,
  }), [teams]);

  const handleOpenCreate = useCallback(() => {
    setEditingTeam(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      parent_team_id: team.parent_team_id ?? undefined,
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingTeam, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingTeam) {
      deleteMutation.mutate(deletingTeam.id);
    }
  }, [deletingTeam, deleteMutation]);

  const handleViewMembers = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsMembersDialogOpen(true);
  }, []);

  return {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    isMembersDialogOpen, setIsMembersDialogOpen,
    editingTeam, deletingTeam, setDeletingTeam,
    selectedTeam, teamMembers,
    formData, setFormData,
    teams: filteredTeams, employees, stats,
    isLoading, isLoadingMembers,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleViewMembers,
  };
}
