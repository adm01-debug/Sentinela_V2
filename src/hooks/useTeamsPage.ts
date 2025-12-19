import { useState, useMemo, useCallback } from 'react';
import { useTeams, type Team } from '@/hooks/useTeams';
import { useEmployees } from '@/hooks/useEmployees';

export interface TeamFormData {
  name: string;
  description: string;
  leader_id: string;
  color: string;
}

const initialFormData: TeamFormData = {
  name: '',
  description: '',
  leader_id: '',
  color: '#3b82f6',
};

export const TEAM_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
] as const;

export function useTeamsPage() {
  const { teams, loading, createTeam, updateTeam, deleteTeam } = useTeams();
  const { employees } = useEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);

  const filteredTeams = useMemo(() => {
    if (!searchTerm) return teams;
    return teams.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teams, searchTerm]);

  const stats = useMemo(() => ({
    total: teams.length,
    totalMembers: employees.filter(e => e.team_id).length,
    avgSize: teams.length > 0 
      ? Math.round(employees.filter(e => e.team_id).length / teams.length) 
      : 0,
  }), [teams, employees]);

  const getTeamMembers = useCallback((teamId: string) => {
    return employees.filter(e => e.team_id === teamId);
  }, [employees]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedTeam(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) return;
    await createTeam({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      leader_id: formData.leader_id || null,
      color: formData.color,
    });
    resetForm();
    setIsFormDialogOpen(false);
  }, [formData, createTeam, resetForm]);

  const handleUpdate = useCallback(async () => {
    if (!selectedTeam || !formData.name.trim()) return;
    await updateTeam(selectedTeam.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      leader_id: formData.leader_id || null,
      color: formData.color,
    });
    resetForm();
    setIsFormDialogOpen(false);
  }, [selectedTeam, formData, updateTeam, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!selectedTeam) return;
    await deleteTeam(selectedTeam.id);
    setSelectedTeam(null);
    setIsDeleteDialogOpen(false);
  }, [selectedTeam, deleteTeam]);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setIsFormDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      leader_id: team.leader_id || '',
      color: team.color || '#3b82f6',
    });
    setIsFormDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  }, []);

  return {
    teams, filteredTeams, employees, stats, loading, selectedTeam,
    searchTerm, setSearchTerm, formData, setFormData,
    isFormDialogOpen, setIsFormDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    handleCreate, handleUpdate, handleDelete, getTeamMembers,
    openCreateDialog, openEditDialog, openDeleteDialog,
  };
}
