import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'device' | 'screen' | 'network';
}

export interface ApplicationRule {
  id: string;
  name: string;
  category: 'productivity' | 'communication' | 'entertainment' | 'development' | 'other';
  status: 'allowed' | 'blocked' | 'monitored';
}

const logAuditChange = async (params: {
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('settings_audit_log')
      .insert({
        user_id: user.id,
        user_email: user.email || 'unknown',
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_name: params.entityName,
        old_value: params.oldValue || null,
        new_value: params.newValue || null,
      });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

export function useSettings() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [appRules, setAppRules] = useState<ApplicationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesRes, rulesRes] = await Promise.all([
        supabase.from('security_policies').select('*').order('created_at'),
        supabase.from('application_rules').select('*').order('name')
      ]);

      if (policiesRes.error) throw policiesRes.error;
      if (rulesRes.error) throw rulesRes.error;

      setPolicies(policiesRes.data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        enabled: p.enabled,
        category: p.category as SecurityPolicy['category']
      })));

      setAppRules(rulesRes.data.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category as ApplicationRule['category'],
        status: r.status as ApplicationRule['status']
      })));
    } catch (error: any) {
      toast.error('Erro ao carregar configurações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (id: string, enabled: boolean) => {
    const policy = policies.find(p => p.id === id);
    try {
      const { error } = await supabase
        .from('security_policies')
        .update({ enabled })
        .eq('id', id);

      if (error) throw error;

      setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled } : p));
      
      // Log the change
      await logAuditChange({
        action: enabled ? 'ATIVAR' : 'DESATIVAR',
        entityType: 'policy',
        entityId: id,
        entityName: policy?.name || 'Política',
        oldValue: { enabled: !enabled },
        newValue: { enabled }
      });

      toast.success(`${policy?.name} ${enabled ? 'ativado' : 'desativado'}`);
    } catch (error: any) {
      toast.error('Erro ao atualizar política: ' + error.message);
    }
  };

  const updateAppRule = async (id: string, status: ApplicationRule['status']) => {
    const rule = appRules.find(r => r.id === id);
    const oldStatus = rule?.status;
    try {
      const { error } = await supabase
        .from('application_rules')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setAppRules(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      
      // Log the change
      await logAuditChange({
        action: 'ALTERAR_STATUS',
        entityType: 'app_rule',
        entityId: id,
        entityName: rule?.name || 'Aplicativo',
        oldValue: { status: oldStatus },
        newValue: { status }
      });

      const statusLabel = status === 'allowed' ? 'Permitido' : status === 'blocked' ? 'Bloqueado' : 'Monitorado';
      toast.success(`${rule?.name} alterado para ${statusLabel}`);
    } catch (error: any) {
      toast.error('Erro ao atualizar regra: ' + error.message);
    }
  };

  const addAppRule = async (name: string, category: ApplicationRule['category'], status: ApplicationRule['status']) => {
    try {
      const { data, error } = await supabase
        .from('application_rules')
        .insert({ name, category, status })
        .select()
        .single();

      if (error) throw error;

      setAppRules(prev => [...prev, {
        id: data.id,
        name: data.name,
        category: data.category as ApplicationRule['category'],
        status: data.status as ApplicationRule['status']
      }]);
      
      // Log the change
      await logAuditChange({
        action: 'CRIAR',
        entityType: 'app_rule',
        entityId: data.id,
        entityName: name,
        newValue: { name, category, status }
      });

      toast.success(`${name} adicionado com sucesso`);
      return true;
    } catch (error: any) {
      toast.error('Erro ao adicionar aplicativo: ' + error.message);
      return false;
    }
  };

  const deleteAppRule = async (id: string) => {
    const rule = appRules.find(r => r.id === id);
    try {
      const { error } = await supabase
        .from('application_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppRules(prev => prev.filter(r => r.id !== id));
      
      // Log the change
      await logAuditChange({
        action: 'EXCLUIR',
        entityType: 'app_rule',
        entityId: id,
        entityName: rule?.name || 'Aplicativo',
        oldValue: { name: rule?.name, category: rule?.category, status: rule?.status }
      });

      toast.success(`${rule?.name} removido com sucesso`);
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover aplicativo: ' + error.message);
      return false;
    }
  };

  const editAppRule = async (id: string, name: string, category: ApplicationRule['category']) => {
    const rule = appRules.find(r => r.id === id);
    try {
      const { error } = await supabase
        .from('application_rules')
        .update({ name, category })
        .eq('id', id);

      if (error) throw error;

      setAppRules(prev => prev.map(r => r.id === id ? { ...r, name, category } : r));
      
      // Log the change
      await logAuditChange({
        action: 'EDITAR',
        entityType: 'app_rule',
        entityId: id,
        entityName: name,
        oldValue: { name: rule?.name, category: rule?.category },
        newValue: { name, category }
      });

      toast.success(`${name} atualizado com sucesso`);
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar aplicativo: ' + error.message);
      return false;
    }
  };

  return {
    policies,
    appRules,
    loading,
    updatePolicy,
    updateAppRule,
    addAppRule,
    deleteAppRule,
    editAppRule,
    refetch: fetchData
  };
}
