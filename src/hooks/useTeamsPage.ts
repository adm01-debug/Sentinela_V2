import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager_name?: string;
  parent_team_id?: string;
  is_active: boolean;
  created_at: string;
  members_count: number;
}

export interface TeamMember {
  id: string;
  employee_id: string;
  team_id: string;
  role: 'member' | 'lead' | 'manager';
  joined_at: string;
  employee: {
    id: string;
    name: string;
    email: string;
    position?: string;
  };
}

export interface TeamFormData {
  name: string;
  description: string;
  manager_id?: string;
  parent_team_id?: string;
  is_active: boolean;
}

const initialFormData: TeamFormData = {
  name: '',
  description: '',
  manager_id: undefined,
  parent_team_id: undefined,
  is_active: true,
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
        .select('*, employees!teams_manager_id_fkey(name)')
        .order('name');
      if (error) throw error;
      return data.map(t => ({
        ...t,
        manager_name: t.employees?.name,
        members_count: t.members_count || 0,
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
        .select('*, employees(id, name, email, position)')
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
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && team.is_active) ||
        (statusFilter === 'inactive' && !team.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [teams, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: teams.length,
    active: teams.filter(t => t.is_active).length,
    totalMembers: teams.reduce((sum, t) => sum + t.members_count, 0),
    withManager: teams.filter(t => t.manager_id).length,
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
      manager_id: team.manager_id,
      parent_team_id: team.parent_team_id,
      is_active: team.is_active,
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
