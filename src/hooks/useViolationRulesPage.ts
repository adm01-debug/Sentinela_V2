import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type RuleType = 'app' | 'url' | 'keyword' | 'time' | 'geofence' | 'idle' | 'usb' | 'print';
export type RuleAction = 'alert' | 'block' | 'log' | 'notify_manager';
export type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ViolationRule {
  id: string;
  name: string;
  description?: string;
  type: RuleType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  severity: RuleSeverity;
  is_active: boolean;
  applies_to: 'all' | 'teams' | 'employees';
  team_ids?: string[];
  employee_ids?: string[];
  created_at: string;
  updated_at: string;
  triggered_count: number;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
}

export interface RuleFormData {
  name: string;
  description: string;
  type: RuleType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  severity: RuleSeverity;
  is_active: boolean;
  applies_to: 'all' | 'teams' | 'employees';
  team_ids: string[];
  employee_ids: string[];
}

export const RULE_TYPES: Array<{ value: RuleType; label: string; icon: string }> = [
  { value: 'app', label: 'Aplicativo', icon: 'AppWindow' },
  { value: 'url', label: 'URL/Website', icon: 'Globe' },
  { value: 'keyword', label: 'Palavra-chave', icon: 'Search' },
  { value: 'time', label: 'Horário', icon: 'Clock' },
  { value: 'geofence', label: 'Localização', icon: 'MapPin' },
  { value: 'idle', label: 'Ociosidade', icon: 'Moon' },
  { value: 'usb', label: 'USB', icon: 'Usb' },
  { value: 'print', label: 'Impressão', icon: 'Printer' },
];

export const RULE_ACTIONS: Array<{ value: RuleAction; label: string }> = [
  { value: 'alert', label: 'Criar alerta' },
  { value: 'block', label: 'Bloquear ação' },
  { value: 'log', label: 'Apenas registrar' },
  { value: 'notify_manager', label: 'Notificar gerente' },
];

const initialFormData: RuleFormData = {
  name: '',
  description: '',
  type: 'app',
  conditions: [{ field: 'app_name', operator: 'contains', value: '' }],
  actions: ['alert'],
  severity: 'medium',
  is_active: true,
  applies_to: 'all',
  team_ids: [],
  employee_ids: [],
};

export function useViolationRulesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ViolationRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<ViolationRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(initialFormData);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['violation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ViolationRule[];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const { error } = await supabase.from('violation_rules').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violation-rules'] });
      toast({ title: 'Regra criada com sucesso!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar regra', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RuleFormData }) => {
      const { error } = await supabase.from('violation_rules').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violation-rules'] });
      toast({ title: 'Regra atualizada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('violation_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violation-rules'] });
      toast({ title: 'Regra excluída!' });
      setIsDeleteDialogOpen(false);
      setDeletingRule(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('violation_rules').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violation-rules'] });
    },
  });

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = !searchTerm || 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || rule.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && rule.is_active) ||
        (statusFilter === 'inactive' && !rule.is_active);
      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [rules, searchTerm, typeFilter, severityFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: rules.length,
    active: rules.filter(r => r.is_active).length,
    byType: RULE_TYPES.map(t => ({ ...t, count: rules.filter(r => r.type === t.value).length })),
    bySeverity: {
      critical: rules.filter(r => r.severity === 'critical').length,
      high: rules.filter(r => r.severity === 'high').length,
      medium: rules.filter(r => r.severity === 'medium').length,
      low: rules.filter(r => r.severity === 'low').length,
    },
  }), [rules]);

  const handleOpenCreate = useCallback(() => {
    setEditingRule(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((rule: ViolationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      conditions: rule.conditions || [],
      actions: rule.actions || [],
      severity: rule.severity,
      is_active: rule.is_active,
      applies_to: rule.applies_to,
      team_ids: rule.team_ids || [],
      employee_ids: rule.employee_ids || [],
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

  const handleToggle = useCallback((rule: ViolationRule) => {
    toggleMutation.mutate({ id: rule.id, is_active: !rule.is_active });
  }, [toggleMutation]);

  return {
    searchTerm, setSearchTerm,
    typeFilter, setTypeFilter,
    severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingRule, deletingRule, setDeletingRule,
    formData, setFormData,
    rules: filteredRules, teams, stats, isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleToggle,
    RULE_TYPES, RULE_ACTIONS,
  };
}
