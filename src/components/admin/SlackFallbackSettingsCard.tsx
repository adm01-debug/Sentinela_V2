import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, X, AlertCircle, CheckCircle2, XCircle, Clock, FlaskConical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type ChaosMode = 'real' | 'timeout' | 'error_429' | 'error_500' | 'partial_failure';
const SETTING_TYPE = 'slack_fallback';

interface FallbackSetting {
  id: string;
  setting_type: string;
  recipient_emails: string[];
  notify_critical: boolean;
  notify_high: boolean;
  notify_medium: boolean;
  notify_low: boolean;
  enabled: boolean;
}

export function SlackFallbackSettingsCard() {
  const qc = useQueryClient();
  const [emailInput, setEmailInput] = useState('');
  const [local, setLocal] = useState<Partial<FallbackSetting>>({});
  const [chaosMode, setChaosMode] = useState<ChaosMode>('real');
  const [testing, setTesting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['slack-fallback-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_notification_settings')
        .select('*')
        .eq('setting_type', SETTING_TYPE)
        .maybeSingle();
      if (error) throw error;
      return data as FallbackSetting | null;
    },
  });

  const { data: lastTest } = useQuery({
    queryKey: ['slack-fallback-last-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edge_function_logs')
        .select('status, created_at, metadata')
        .eq('function_name', 'slack-fallback-test')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as {
        status: string;
        created_at: string;
        metadata: { triggered_by?: string; recipients_count?: number; resend_id?: string | null; error?: string | null };
      } | null;
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) setLocal(data);
    else setLocal({
      recipient_emails: [],
      notify_critical: true,
      notify_high: true,
      notify_medium: false,
      notify_low: false,
      enabled: true,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async (payload: Partial<FallbackSetting>) => {
      const row = {
        setting_type: SETTING_TYPE,
        recipient_emails: payload.recipient_emails ?? [],
        notify_critical: payload.notify_critical ?? true,
        notify_high: payload.notify_high ?? true,
        notify_medium: payload.notify_medium ?? false,
        notify_low: payload.notify_low ?? false,
        enabled: payload.enabled ?? true,
      };
      const { error } = await supabase
        .from('alert_notification_settings')
        .upsert(row, { onConflict: 'setting_type' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Fallback Resend salvo com sucesso');
      qc.invalidateQueries({ queryKey: ['slack-fallback-settings'] });
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('E-mail inválido');
      return;
    }
    const current = local.recipient_emails ?? [];
    if (current.includes(email)) {
      toast.warning('E-mail já adicionado');
      return;
    }
    setLocal({ ...local, recipient_emails: [...current, email] });
    setEmailInput('');
  };

  const removeEmail = (email: string) => {
    setLocal({
      ...local,
      recipient_emails: (local.recipient_emails ?? []).filter((e) => e !== email),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Fallback E-mail (Resend)
            </CardTitle>
            <CardDescription>
              Destinatários acionados quando o Slack falha ou está pausado.
            </CardDescription>
          </div>
          <Switch
            checked={local.enabled ?? true}
            onCheckedChange={(v) => setLocal({ ...local, enabled: v })}
            disabled={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-warning mt-0.5" />
          <span className="text-muted-foreground">
            Requer <code className="font-mono">RESEND_API_KEY</code> configurada nas variáveis de ambiente.
          </span>
        </div>

        {lastTest && (
          <div className="flex items-start gap-2 rounded-md border p-3 text-sm">
            {lastTest.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 flex-shrink-0 text-destructive mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  Último teste: {lastTest.status === 'success' ? 'Sucesso' : 'Falha'}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(lastTest.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lastTest.metadata?.recipients_count ?? 0} destinatário(s)
                {lastTest.metadata?.triggered_by && ` · por ${lastTest.metadata.triggered_by}`}
                {lastTest.metadata?.error && ` · ${lastTest.metadata.error.slice(0, 80)}`}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Destinatários</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="alerta@empresa.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
            />
            <Button type="button" variant="secondary" onClick={addEmail}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(local.recipient_emails ?? []).map((email) => (
              <Badge key={email} variant="secondary" className="gap-1">
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remover ${email}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(local.recipient_emails ?? []).length === 0 && (
              <span className="text-xs text-muted-foreground">Nenhum destinatário configurado.</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notificar por severidade</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'notify_critical', label: 'Crítico' },
              { key: 'notify_high', label: 'Alto' },
              { key: 'notify_medium', label: 'Médio' },
              { key: 'notify_low', label: 'Baixo' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm">{label}</span>
                <Switch
                  checked={Boolean(local[key as keyof FallbackSetting])}
                  onCheckedChange={(v) => setLocal({ ...local, [key]: v })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-dashed p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FlaskConical className="h-4 w-4 text-primary" />
            Modo de teste (Chaos Engineering)
          </div>
          <p className="text-xs text-muted-foreground">
            Injeta falhas simuladas para validar o comportamento do sistema em cenários adversos.
            Modos chaos são registrados como <code className="font-mono">simulated: true</code> na auditoria.
          </p>
          <Select value={chaosMode} onValueChange={(v) => setChaosMode(v as ChaosMode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real">Real — envia via Resend</SelectItem>
              <SelectItem value="timeout">Timeout — 8s sem resposta</SelectItem>
              <SelectItem value="error_429">Rate limit 429 — provedor limitou</SelectItem>
              <SelectItem value="error_500">Erro 500 — falha upstream</SelectItem>
              <SelectItem value="partial_failure">Falha parcial — metade rejeitada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => save.mutate(local)}
            disabled={save.isPending || isLoading}
          >
            {save.isPending ? 'Salvando...' : 'Salvar configurações'}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setTesting(true);
              const label = chaosMode === 'real' ? 'Enviando teste real...' : `Simulando [${chaosMode}]...`;
              const t = toast.loading(label);
              const { data, error } = await supabase.functions.invoke('slack-fallback-test', {
                body: { mode: chaosMode },
              });
              toast.dismiss(t);
              if (error) toast.error(`Falha: ${error.message}`);
              else toast.success(data?.message ?? 'Teste concluído');
              qc.invalidateQueries({ queryKey: ['slack-fallback-last-test'] });
              setTesting(false);
            }}
            disabled={testing || !local.enabled || (local.recipient_emails ?? []).length === 0}
          >
            {testing ? 'Executando...' : chaosMode === 'real' ? 'Testar' : `Simular ${chaosMode}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
