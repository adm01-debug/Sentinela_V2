import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ViolationRuleType = 'blocked_site' | 'blocked_keyword' | 'blocked_app' | 'blocked_file_extension' | 'work_hours';

export interface ViolationRule {
  id: string;
  rule_type: ViolationRuleType;
  rule_value: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notify_employee: boolean;
  notify_admin: boolean;
  created_at: string;
}

export const ruleTypeLabels: Record<ViolationRuleType, string> = {
  blocked_site: 'Site Bloqueado',
  blocked_keyword: 'Palavra-chave Bloqueada',
  blocked_app: 'Aplicativo Bloqueado',
  blocked_file_extension: 'Extensão de Arquivo Bloqueada',
  work_hours: 'Horário de Trabalho'
};

export const severityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export function useViolationRules() {
  const [rules, setRules] = useState<ViolationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('violation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRules(data.map(r => ({
        id: r.id,
        rule_type: r.rule_type as ViolationRuleType,
        rule_value: r.rule_value,
        description: r.description,
        severity: r.severity as ViolationRule['severity'],
        is_active: r.is_active,
        notify_employee: r.notify_employee,
        notify_admin: r.notify_admin,
        created_at: r.created_at
      })));
    } catch (error: any) {
      toast.error('Erro ao carregar regras: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addRule = async (rule: Omit<ViolationRule, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('violation_rules')
        .insert({
          rule_type: rule.rule_type,
          rule_value: rule.rule_value,
          description: rule.description,
          severity: rule.severity,
          is_active: rule.is_active,
          notify_employee: rule.notify_employee,
          notify_admin: rule.notify_admin,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setRules(prev => [{
        id: data.id,
        rule_type: data.rule_type as ViolationRuleType,
        rule_value: data.rule_value,
        description: data.description,
        severity: data.severity as ViolationRule['severity'],
        is_active: data.is_active,
        notify_employee: data.notify_employee,
        notify_admin: data.notify_admin,
        created_at: data.created_at
      }, ...prev]);

      toast.success('Regra adicionada com sucesso');
      return true;
    } catch (error: any) {
      toast.error('Erro ao adicionar regra: ' + error.message);
      return false;
    }
  };

  const updateRule = async (id: string, updates: Partial<ViolationRule>) => {
    try {
      const { error } = await supabase
        .from('violation_rules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      toast.success('Regra atualizada');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar regra: ' + error.message);
      return false;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('violation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Regra removida');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover regra: ' + error.message);
      return false;
    }
  };

  const toggleRule = async (id: string, is_active: boolean) => {
    return updateRule(id, { is_active });
  };

  return {
    rules,
    loading,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules
  };
}
