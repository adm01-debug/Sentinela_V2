import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface MonitoringPolicy {
  id: string;
  name: string;
  description?: string;
  screenshot_interval: number;
  activity_tracking: boolean;
  app_tracking: boolean;
  url_tracking: boolean;
  keystroke_tracking: boolean;
  location_tracking: boolean;
  idle_detection: boolean;
  idle_threshold: number;
  work_hours_only: boolean;
  applies_to: 'all' | 'teams' | 'employees';
  team_ids?: string[];
  employee_ids?: string[];
  is_active: boolean;
  created_at: string;
}

export interface PolicyFormData {
  name: string;
  description: string;
  screenshot_interval: number;
  activity_tracking: boolean;
  app_tracking: boolean;
  url_tracking: boolean;
  keystroke_tracking: boolean;
  location_tracking: boolean;
  idle_detection: boolean;
  idle_threshold: number;
  work_hours_only: boolean;
  applies_to: 'all' | 'teams' | 'employees';
  is_active: boolean;
}

const initialFormData: PolicyFormData = {
  name: '',
  description: '',
  screenshot_interval: 300,
  activity_tracking: true,
  app_tracking: true,
  url_tracking: true,
  keystroke_tracking: false,
  location_tracking: false,
  idle_detection: true,
  idle_threshold: 300,
  work_hours_only: true,
  applies_to: 'all',
  is_active: true,
};

export function useMonitoringPoliciesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<MonitoringPolicy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<MonitoringPolicy | null>(null);
  const [formData, setFormData] = useState<PolicyFormData>(initialFormData);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['monitoring-policies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('monitoring_policies').select('*').order('name');
      if (error) throw error;
      return data as MonitoringPolicy[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PolicyFormData) => {
      const { error } = await supabase.from('monitoring_policies').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-policies'] });
      toast({ title: 'Politica criada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PolicyFormData }) => {
      const { error } = await supabase.from('monitoring_policies').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-policies'] });
      toast({ title: 'Politica atualizada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('monitoring_policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-policies'] });
      toast({ title: 'Politica excluida!' });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [policies, searchTerm]);

  const stats = useMemo(() => ({
    total: policies.length,
    active: policies.filter(p => p.is_active).length,
    withScreenshots: policies.filter(p => p.screenshot_interval > 0).length,
    withLocation: policies.filter(p => p.location_tracking).length,
  }), [policies]);

  const handleOpenCreate = useCallback(() => {
    setEditingPolicy(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((policy: MonitoringPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      screenshot_interval: policy.screenshot_interval,
      activity_tracking: policy.activity_tracking,
      app_tracking: policy.app_tracking,
      url_tracking: policy.url_tracking,
      keystroke_tracking: policy.keystroke_tracking,
      location_tracking: policy.location_tracking,
      idle_detection: policy.idle_detection,
      idle_threshold: policy.idle_threshold,
      work_hours_only: policy.work_hours_only,
      applies_to: policy.applies_to,
      is_active: policy.is_active,
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingPolicy(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingPolicy) {
      updateMutation.mutate({ id: editingPolicy.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingPolicy, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingPolicy) {
      deleteMutation.mutate(deletingPolicy.id);
    }
  }, [deletingPolicy, deleteMutation]);

  return {
    searchTerm, setSearchTerm,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingPolicy, deletingPolicy, setDeletingPolicy,
    formData, setFormData,
    policies: filteredPolicies, stats, isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete,
  };
}
