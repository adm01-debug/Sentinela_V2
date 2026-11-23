import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useAlertRules } from '@/hooks/useAlerts';
import { supabase } from '@/integrations/supabase/client';

type ViolationRuleType =
  | 'blocked_site'
  | 'blocked_keyword'
  | 'blocked_app'
  | 'blocked_file_extension'
  | 'work_hours';

interface AlertRule {
  id: string;
  rule_type: ViolationRuleType;
  rule_value: string;
  description: string | null;
  severity: string;
  is_active: boolean;
}

const RULE_TYPE_LABELS: Record<ViolationRuleType, string> = {
  blocked_site: 'Site bloqueado',
  blocked_keyword: 'Palavra-chave',
  blocked_app: 'Aplicativo bloqueado',
  blocked_file_extension: 'Extensão de arquivo',
  work_hours: 'Horário de trabalho',
};

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

const SEVERITY_VARIANT: Record<string, 'secondary' | 'default' | 'destructive'> = {
  low: 'secondary',
  medium: 'secondary',
  high: 'default',
  critical: 'destructive',
};

export default function AlertRulesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: rulesData, isLoading } = useAlertRules();
  const queryClient = useQueryClient();

  const rules = (rulesData || []) as AlertRule[];

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('violation_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast.success('Regra excluída');
    },
    onError: () => { toast.error('Erro ao excluir regra'); },
  });

  const toggleRule = useMutation({
    mutationFn: async (id: string) => {
      const rule = rules.find(r => r.id === id);
      if (!rule) return;
      const { error } = await supabase
        .from('violation_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alert-rules'] }); },
    onError: () => { toast.error('Erro ao atualizar regra'); },
  });

  if (isLoading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Regras de Alerta</h1>
        <Link to="/alerts/rules/new"><Button><Plus className="mr-2 h-4 w-4" />Nova Regra</Button></Link>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma regra cadastrada. Crie a primeira para começar a receber alertas.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <CardTitle className="text-base">
                    {RULE_TYPE_LABELS[rule.rule_type] ?? rule.rule_type}
                  </CardTitle>
                </div>
                <Switch
                  checked={rule.is_active}
                  disabled={toggleRule.isPending}
                  onCheckedChange={() => toggleRule.mutate(rule.id)}
                  aria-label={`Ativar regra ${rule.rule_value}`}
                />
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm break-all mb-1">{rule.rule_value}</p>
                {rule.description && (
                  <p className="text-xs text-muted-foreground mb-3">{rule.description}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={SEVERITY_VARIANT[rule.severity] ?? 'secondary'}>
                    {SEVERITY_LABELS[rule.severity] ?? rule.severity}
                  </Badge>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(rule.id)} aria-label="Excluir regra">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteRule.mutate(deleteId!); setDeleteId(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}