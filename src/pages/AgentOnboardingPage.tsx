import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  KeyRound,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Monitor,
  Loader2,
  CheckCircle2,
  Circle,
  Wifi,
  Apple,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4;

const STEPS: Array<{ id: Step; label: string; icon: typeof KeyRound }> = [
  { id: 1, label: 'Gerar chave', icon: KeyRound },
  { id: 2, label: 'Baixar agente', icon: Download },
  { id: 3, label: 'Instalar', icon: Monitor },
  { id: 4, label: 'Confirmar conexão', icon: ShieldCheck },
];

interface AgentKeyRow {
  id: string;
  key_name: string;
  agent_key: string;
  employee_name: string | null;
  device_name: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export default function AgentOnboardingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [keyName, setKeyName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<AgentKeyRow | null>(null);
  const [copied, setCopied] = useState(false);

  const connectionQuery = useQuery({
    queryKey: ['agent-onboarding-connection', generatedKey?.id],
    queryFn: async () => {
      if (!generatedKey) return null;
      const { data, error } = await supabase
        .from('agent_keys')
        .select('id, last_seen_at, is_active')
        .eq('id', generatedKey.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!generatedKey && step === 4,
    refetchInterval: step === 4 ? 5000 : false,
  });

  const isConnected = useMemo(
    () => !!connectionQuery.data?.last_seen_at,
    [connectionQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!keyName.trim()) throw new Error('Informe um nome para a chave');
      const { data, error } = await supabase
        .from('agent_keys')
        .insert({
          key_name: keyName.trim(),
          employee_name: employeeName.trim() || null,
          device_name: deviceName.trim() || null,
          is_active: true,
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as AgentKeyRow;
    },
    onSuccess: (row) => {
      setGeneratedKey(row);
      queryClient.invalidateQueries({ queryKey: ['agent-keys'] });
      toast({ title: 'Chave gerada com sucesso' });
      setStep(2);
    },
    onError: (error: Error) => {
      toast({
        title: 'Não foi possível gerar a chave',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCopy = async () => {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey.agent_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: 'Chave copiada' });
  };

  const silentInstallCommand = generatedKey
    ? `sentinela-agent-setup.exe /S /AGENT_KEY=${generatedKey.agent_key}`
    : '';

  return (
    <PageLayout>
      <PageHeader
        title="Onboarding do Agente"
        description="Guie a instalação do agente Sentinela em 4 passos: gere a chave, baixe o instalador, execute e valide a conexão em tempo real."
      />

      {/* Stepper */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  active && 'border-primary bg-primary/10 text-primary',
                  done && 'border-success/40 bg-success/10 text-success',
                  !active && !done && 'border-border text-muted-foreground',
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span className="font-medium">
                  {s.id}. {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && <Circle className="h-1.5 w-1.5 fill-border text-border" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Generate key */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Passo 1 · Gerar Agent Key
            </CardTitle>
            <CardDescription>
              A chave vincula o agente a um colaborador ou dispositivo específico da sua empresa. Ela
              é única, sensível e trafega apenas via HTTPS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="key_name">Nome da chave *</Label>
                <Input
                  id="key_name"
                  placeholder="Ex.: Notebook João - RH"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_name">Colaborador</Label>
                <Input
                  id="employee_name"
                  placeholder="Nome do funcionário"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device_name">Dispositivo</Label>
                <Input
                  id="device_name"
                  placeholder="Hostname ou identificador"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
            </div>
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Somente administradores</AlertTitle>
              <AlertDescription>
                A geração de chaves é restrita ao perfil admin, por políticas RLS no backend.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar chave e avançar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Download */}
      {step === 2 && generatedKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> Passo 2 · Baixar o instalador
            </CardTitle>
            <CardDescription>
              Copie a chave gerada e baixe o pacote correspondente ao sistema operacional do
              colaborador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Agent Key
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-background px-3 py-2 font-mono text-sm">
                  {generatedKey.agent_key}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copiar chave">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Guarde essa chave — ela não pode ser recuperada depois. Vinculada a{' '}
                <strong>{generatedKey.key_name}</strong>.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <DownloadCard
                icon={<Monitor className="h-6 w-6" />}
                title="Windows 10/11"
                subtitle="Instalador .exe · requer admin"
                href="https://releases.sentinela.app/agent/sentinela-agent-setup.exe"
              />
              <DownloadCard
                icon={<Apple className="h-6 w-6" />}
                title="macOS 12+"
                subtitle="Pacote .dmg universal"
                href="https://releases.sentinela.app/agent/sentinela-agent.dmg"
              />
              <DownloadCard
                icon={<Terminal className="h-6 w-6" />}
                title="Linux (Debian/RPM)"
                subtitle=".deb e .rpm disponíveis"
                href="https://releases.sentinela.app/agent/sentinela-agent.deb"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(3)}>Já baixei — continuar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Install */}
      {step === 3 && generatedKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" /> Passo 3 · Instalar no dispositivo
            </CardTitle>
            <CardDescription>
              Execute o instalador com privilégios de administrador. O agente se registra
              automaticamente após a primeira comunicação com o backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Modo interativo</h3>
              <ol className="ml-5 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Execute o instalador baixado como administrador.</li>
                <li>Cole a Agent Key quando solicitado.</li>
                <li>Aguarde o serviço iniciar — o ícone aparecerá na bandeja (a menos que o modo stealth esteja ativo).</li>
              </ol>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 text-sm font-semibold">Instalação silenciosa (enterprise / GPO / Intune)</h3>
              <div className="rounded-lg border bg-muted/30 p-3">
                <code className="block break-all font-mono text-xs">{silentInstallCommand}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={async () => {
                  await navigator.clipboard.writeText(silentInstallCommand);
                  toast({ title: 'Comando copiado' });
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar comando
              </Button>
            </div>

            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Requer privilégios de administrador</AlertTitle>
              <AlertDescription>
                Necessário para bloqueio de USB, interceptação de Print Screen e execução como serviço
                do sistema.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(4)}>Instalei — validar conexão</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Verify */}
      {step === 4 && generatedKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" /> Passo 4 · Aguardando conexão do agente
            </CardTitle>
            <CardDescription>
              Estamos monitorando em tempo real a primeira comunicação do agente com o backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <Alert className="border-success/40 bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle>Agente conectado com sucesso</AlertTitle>
                <AlertDescription>
                  Última comunicação:{' '}
                  <strong>
                    {connectionQuery.data?.last_seen_at
                      ? new Date(connectionQuery.data.last_seen_at).toLocaleString('pt-BR')
                      : '—'}
                  </strong>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Aguardando primeiro sinal…</div>
                  <div className="text-muted-foreground">
                    Verificando a cada 5 segundos. Certifique-se de que o dispositivo tem acesso à
                    internet.
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3 rounded-lg border p-4 text-sm md:grid-cols-2">
              <InfoRow label="Chave" value={generatedKey.key_name} />
              <InfoRow label="Status" value={<Badge variant={isConnected ? 'default' : 'secondary'}>{isConnected ? 'Conectado' : 'Aguardando'}</Badge>} />
              <InfoRow label="Colaborador" value={generatedKey.employee_name || '—'} />
              <InfoRow label="Dispositivo" value={generatedKey.device_name || '—'} />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button
                onClick={() => {
                  setStep(1);
                  setGeneratedKey(null);
                  setKeyName('');
                  setEmployeeName('');
                  setDeviceName('');
                }}
              >
                Cadastrar outro agente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

function DownloadCard({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold group-hover:text-primary">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
