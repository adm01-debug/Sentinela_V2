import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface InternetAccessRule {
  id: string;
  name: string;
  description?: string;
  type: 'block' | 'allow';
  target_type: 'domain' | 'url' | 'category';
  target_value: string;
  applies_to: 'all' | 'teams' | 'employees';
  team_ids?: string[];
  employee_ids?: string[];
  is_active: boolean;
  created_at: string;
  blocked_count: number;
}

export interface RuleFormData {
  name: string;
  description: string;
  type: 'block' | 'allow';
  target_type: 'domain' | 'url' | 'category';
  target_value: string;
  applies_to: 'all' | 'teams' | 'employees';
  is_active: boolean;
}

export const URL_CATEGORIES = [
  { value: 'social', label: 'Redes Sociais' },
  { value: 'streaming', label: 'Streaming' },
  { value: 'gaming', label: 'Jogos' },
  { value: 'shopping', label: 'Compras' },
  { value: 'adult', label: 'Adulto' },
  { value: 'gambling', label: 'Apostas' },
];

const initialFormData: RuleFormData = {
  name: '',
  description: '',
  type: 'block',
  target_type: 'domain',
  target_value: '',
  applies_to: 'all',
  is_active: true,
};

export function useInternetAccessPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<InternetAccessRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<InternetAccessRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(initialFormData);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['internet-access-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('internet_access_rules').select('*').order('name');
      if (error) throw error;
      return data as InternetAccessRule[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const { error } = await supabase.from('internet_access_rules').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internet-access-rules'] });
      toast({ title: 'Regra criada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RuleFormData }) => {
      const { error } = await supabase.from('internet_access_rules').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internet-access-rules'] });
      toast({ title: 'Atualizado!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('internet_access_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internet-access-rules'] });
      toast({ title: 'Excluido!' });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = !searchTerm || rule.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || rule.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [rules, searchTerm, typeFilter]);

  const stats = useMemo(() => ({
    total: rules.length,
    active: rules.filter(r => r.is_active).length,
    blocked: rules.filter(r => r.type === 'block').length,
    allowed: rules.filter(r => r.type === 'allow').length,
    totalBlocks: rules.reduce((sum, r) => sum + r.blocked_count, 0),
  }), [rules]);

  const handleOpenCreate = useCallback(() => {
    setEditingRule(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((rule: InternetAccessRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      target_type: rule.target_type,
      target_value: rule.target_value,
      applies_to: rule.applies_to,
      is_active: rule.is_active,
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingRule(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingRule, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingRule) {
      deleteMutation.mutate(deletingRule.id);
    }
  }, [deletingRule, deleteMutation]);

  return {
    searchTerm, setSearchTerm,
    typeFilter, setTypeFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingRule, deletingRule, setDeletingRule,
    formData, setFormData,
    rules: filteredRules, stats, isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete,
    URL_CATEGORIES,
  };
}
