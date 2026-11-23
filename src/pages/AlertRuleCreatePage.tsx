import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ViolationRuleType = Database['public']['Enums']['violation_rule_type'];

interface RuleFormData {
  rule_type: ViolationRuleType;
  rule_value: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notify_admin: boolean;
  notify_employee: boolean;
}

const RULE_TYPE_OPTIONS: { value: ViolationRuleType; label: string; placeholder: string }[] = [
  { value: 'blocked_site', label: 'Site bloqueado', placeholder: 'ex.: facebook.com' },
  { value: 'blocked_keyword', label: 'Palavra-chave', placeholder: 'ex.: confidencial' },
  { value: 'blocked_app', label: 'Aplicativo bloqueado', placeholder: 'ex.: telegram.exe' },
  { value: 'blocked_file_extension', label: 'Extensão de arquivo', placeholder: 'ex.: .exe' },
  { value: 'work_hours', label: 'Horário de trabalho', placeholder: 'ex.: 08:00-18:00' },
];

export default function AlertRuleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createRule = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const { error } = await supabase.from('violation_rules').insert({
        rule_type: data.rule_type,
        rule_value: data.rule_value.trim(),
        description: data.description?.trim() || null,
        severity: data.severity,
        is_active: true,
        notify_admin: data.notify_admin,
        notify_employee: data.notify_employee,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast.success('Regra criada com sucesso');
      navigate('/alerts/rules');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar regra: ${error.message}`);
    },
  });

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<RuleFormData>({
    defaultValues: {
      rule_type: 'blocked_site',
      rule_value: '',
      description: '',
      severity: 'medium',
      notify_admin: true,
      notify_employee: true,
    },
  });

  const ruleType = useWatch({ control, name: 'rule_type' });
  const severity = useWatch({ control, name: 'severity' });
  const notifyAdmin = useWatch({ control, name: 'notify_admin' });
  const notifyEmployee = useWatch({ control, name: 'notify_employee' });
  const selectedType = RULE_TYPE_OPTIONS.find(o => o.value === ruleType);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Regra de Alerta</h1>
      </div>

      <form onSubmit={handleSubmit((data) => createRule.mutate(data))}>
        <Card>
          <CardHeader><CardTitle>Configurar Regra</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Regra</Label>
              <Select
                value={ruleType}
                onValueChange={(v) => setValue('rule_type', v as ViolationRuleType)}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {RULE_TYPE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_value">Valor</Label>
              <Input
                id="rule_value"
                placeholder={selectedType?.placeholder}
                {...register('rule_value', { required: 'Informe o valor da regra' })}
              />
              {errors.rule_value && (
                <p className="text-sm text-destructive">{errors.rule_value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea id="description" rows={2} {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select value={severity} onValueChange={(v) => setValue('severity', v as RuleFormData['severity'])}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-sm">Notificar administrador</Label>
                <p className="text-xs text-muted-foreground">Envia alerta para os admins da empresa</p>
              </div>
              <Switch checked={notifyAdmin} onCheckedChange={(v) => setValue('notify_admin', v)} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-sm">Notificar colaborador</Label>
                <p className="text-xs text-muted-foreground">Avisa o colaborador monitorado</p>
              </div>
              <Switch checked={notifyEmployee} onCheckedChange={(v) => setValue('notify_employee', v)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" disabled={createRule.isPending}>
              {createRule.isPending ? 'Criando...' : 'Criar Regra'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}