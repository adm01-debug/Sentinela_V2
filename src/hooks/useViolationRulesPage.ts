import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type RuleType = 'app' | 'url' | 'keyword' | 'time' | 'geofence' | 'idle' | 'usb' | 'print';
export type RuleAction = 'alert' | 'block' | 'log' | 'notify_manager';
export type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ViolationRule {
  id: string;
  name: string; // derived from rule_value
  description?: string;
  type: RuleType; // maps to rule_type
  severity: RuleSeverity;
  is_active: boolean;
  notify_employee: boolean;
  notify_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface RuleFormData {
  name: string;
  description: string;
  type: RuleType;
  severity: RuleSeverity;
  is_active: boolean;
  notify_employee: boolean;
  notify_admin: boolean;
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
  severity: 'medium',
  is_active: true,
  notify_employee: false,
  notify_admin: true,
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
      return (data || []).map(r => ({
        id: r.id,
        name: r.rule_value,
        description: r.description,
        type: r.rule_type as RuleType,
        severity: r.severity as RuleSeverity,
        is_active: r.is_active,
        notify_employee: r.notify_employee,
        notify_admin: r.notify_admin,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })) as ViolationRule[];
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
      const dbData = {
        rule_type: data.type,
        rule_value: data.name,
        description: data.description,
        severity: data.severity,
        is_active: data.is_active,
        notify_employee: data.notify_employee,
        notify_admin: data.notify_admin,
      };
      const { error } = await supabase.from('violation_rules').insert(dbData);
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
      const dbData = {
        rule_type: data.type,
        rule_value: data.name,
        description: data.description,
        severity: data.severity,
        is_active: data.is_active,
        notify_employee: data.notify_employee,
        notify_admin: data.notify_admin,
      };
      const { error } = await supabase.from('violation_rules').update(dbData).eq('id', id);
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
      severity: rule.severity,
      is_active: rule.is_active,
      notify_employee: rule.notify_employee,
      notify_admin: rule.notify_admin,
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
