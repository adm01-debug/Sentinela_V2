import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, PauseCircle, Plus, RotateCcw, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Severity = 'warning' | 'critical' | 'breached';

interface SlackIntegration {
  id: string;
  name: string;
  webhook_url: string;
  event_types: string[];
  min_severity: Severity;
  is_active: boolean;
  last_success_at: string | null;
  last_error: string | null;
  last_error_at: string | null;
  failure_count: number;
  auto_pause_threshold: number;
  auto_paused_at: string | null;
  auto_pause_reason: string | null;
  created_at: string;
}

const EVENT_TYPES = [{ value: 'dispute_sla_escalation', label: 'Escalação de SLA de contestação' }];

function maskWebhook(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? '';
    return `${u.origin}/…/${last.slice(0, 4)}…${last.slice(-4)}`;
  } catch {
    return url.slice(0, 24) + '…';
  }
}

export function SlackIntegrationsCard() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [minSeverity, setMinSeverity] = useState<Severity>('critical');
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['slack-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slack_integrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SlackIntegration[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Informe um nome para a integração.');
      if (!/^https:\/\/hooks\.slack\.com\/services\//.test(webhookUrl.trim())) {
        throw new Error('Webhook inválido. Deve começar com https://hooks.slack.com/services/');
      }
      const { error } = await supabase.from('slack_integrations').insert({
        name: name.trim(),
        webhook_url: webhookUrl.trim(),
        min_severity: minSeverity,
        event_types: ['dispute_sla_escalation'],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Integração Slack criada.');
      setName('');
      setWebhookUrl('');
      setMinSeverity('critical');
      qc.invalidateQueries({ queryKey: ['slack-integrations'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('slack_integrations')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slack-integrations'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('slack_integrations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Integração removida.');
      qc.invalidateQueries({ queryKey: ['slack-integrations'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const severityMutation = useMutation({
    mutationFn: async ({ id, min_severity }: { id: string; min_severity: Severity }) => {
      const { error } = await supabase
        .from('slack_integrations')
        .update({ min_severity })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slack-integrations'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const thresholdMutation = useMutation({
    mutationFn: async ({ id, auto_pause_threshold }: { id: string; auto_pause_threshold: number }) => {
      const { error } = await supabase
        .from('slack_integrations')
        .update({ auto_pause_threshold })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slack-integrations'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('slack_integrations')
        .update({
          is_active: true,
          auto_paused_at: null,
          auto_pause_reason: null,
          failure_count: 0,
          last_error: null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Integração reativada. Contador de falhas zerado.');
      qc.invalidateQueries({ queryKey: ['slack-integrations'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function sendTest(integration: SlackIntegration) {
    setTestingId(integration.id);
    try {
      const { data, error } = await supabase.functions.invoke('slack-notify', {
        body: {
          event_type: 'dispute_sla_escalation',
          severity: integration.min_severity,
          title: `Teste de integração — ${integration.name}`,
          message:
            'Este é um teste manual disparado pelo painel de auditoria. Se você recebeu esta mensagem, o webhook está funcionando corretamente.',
          fields: {
            'Origem': 'SecureWatch • Painel Admin',
            'Integração': integration.name,
            'Severidade mínima': integration.min_severity,
          },
        },
      });
      if (error) throw error;
      const delivered = Number((data as { delivered?: number } | null)?.delivered ?? 0);
      if (delivered > 0) {
        toast.success(`Teste entregue com sucesso (${delivered}).`);
      } else {
        toast.warning('Nenhuma integração ativa recebeu o teste. Verifique filtros e status.');
      }
      qc.invalidateQueries({ queryKey: ['slack-integrations'] });
    } catch (e) {
      toast.error(`Falha no teste: ${(e as Error).message}`);
    } finally {
      setTestingId(null);
    }
  }

  useEffect(() => {
    // realtime: quando um alerta for enviado, recarrega para atualizar last_success/last_error
    const channel = supabase
      .channel('slack-integrations-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'slack_integrations' },
        () => qc.invalidateQueries({ queryKey: ['slack-integrations'] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Integrações Slack
        </CardTitle>
        <CardDescription>
          Envie escalações críticas de SLA para canais Slack. Configure um webhook por canal
          (Incoming Webhook do Slack) e escolha a severidade mínima que deve disparar mensagens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-4 md:grid-cols-[1fr_2fr_180px_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="slack-name">Nome</Label>
            <Input
              id="slack-name"
              placeholder="#alertas-sla"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slack-url">Webhook URL</Label>
            <Input
              id="slack-url"
              placeholder="https://hooks.slack.com/services/T.../B.../..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Severidade mínima</Label>
            <Select value={minSeverity} onValueChange={(v) => setMinSeverity(v as Severity)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Atenção (12h)</SelectItem>
                <SelectItem value="critical">Crítico (4h)</SelectItem>
                <SelectItem value="breached">Violado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full md:w-auto"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Adicionar
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando integrações…
          </div>
        ) : integrations.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma integração Slack configurada ainda.
          </div>
        ) : (
          <ul className="space-y-3">
            {integrations.map((i) => (
              <li
                key={i.id}
                className="flex flex-col gap-3 rounded-md border border-border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{i.name}</span>
                    {i.auto_paused_at ? (
                      <Badge variant="destructive" className="gap-1">
                        <PauseCircle className="h-3 w-3" />
                        Auto-pausada
                      </Badge>
                    ) : (
                      <Badge variant={i.is_active ? 'default' : 'secondary'}>
                        {i.is_active ? 'Ativa' : 'Pausada'}
                      </Badge>
                    )}
                    {i.failure_count > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {i.failure_count}/{i.auto_pause_threshold} falhas
                      </Badge>
                    )}
                    {i.last_success_at && (
                      <Badge variant="outline" className="gap-1 text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        {formatDistanceToNow(new Date(i.last_success_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {maskWebhook(i.webhook_url)}
                  </p>
                  {i.auto_pause_reason && (
                    <p className="mt-1 text-xs text-destructive">
                      Auto-pausa: {i.auto_pause_reason}
                    </p>
                  )}
                  {i.last_error && !i.auto_pause_reason && (
                    <p className="mt-1 text-xs text-destructive">Último erro: {i.last_error}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={i.min_severity}
                    onValueChange={(v) =>
                      severityMutation.mutate({ id: i.id, min_severity: v as Severity })
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="breached">Violado</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`th-${i.id}`} className="text-xs text-muted-foreground">
                      Limite
                    </Label>
                    <Input
                      id={`th-${i.id}`}
                      type="number"
                      min={1}
                      max={100}
                      className="w-16"
                      defaultValue={i.auto_pause_threshold}
                      onBlur={(e) => {
                        const v = Math.max(1, Math.min(100, Number(e.target.value) || 5));
                        if (v !== i.auto_pause_threshold) {
                          thresholdMutation.mutate({ id: i.id, auto_pause_threshold: v });
                        }
                      }}
                    />
                  </div>
                  {i.auto_paused_at ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reactivateMutation.mutate(i.id)}
                      disabled={reactivateMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reativar
                    </Button>
                  ) : (
                    <Switch
                      checked={i.is_active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: i.id, is_active: v })}
                      aria-label="Ativar integração"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendTest(i)}
                    disabled={testingId === i.id}
                  >
                    {testingId === i.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Remover integração "${i.name}"?`)) {
                        deleteMutation.mutate(i.id);
                      }
                    }}
                    aria-label="Remover integração"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          Somente severidade igual ou acima do mínimo dispara mensagens. Ao atingir o limite de
          falhas consecutivas (ou receber HTTP 400/403/404/410 do Slack), a integração é
          <strong> pausada automaticamente</strong> — reative manualmente após corrigir o webhook.
        </p>
      </CardContent>
    </Card>
  );
}
