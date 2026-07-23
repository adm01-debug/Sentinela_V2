import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Power, Radio, Wifi, Play, ShieldCheck, ShieldX, ShieldAlert, Clock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLiveViewSession, type ConsentState } from '@/hooks/useLiveViewSession';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, string> = {
  idle: 'Aguardando início',
  authorizing: 'Autorizando…',
  waiting_consent: 'Aguardando consentimento do colaborador',
  waiting_agent: 'Aguardando agente',
  connecting: 'Negociando conexão',
  live: 'AO VIVO',
  ended: 'Encerrada',
  error: 'Erro',
};

const CONSENT_META: Record<ConsentState, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; Icon: typeof ShieldCheck }> = {
  pending: { label: 'Pendente', variant: 'secondary', Icon: Clock },
  granted: { label: 'Consentido', variant: 'default', Icon: ShieldCheck },
  denied: { label: 'Recusado', variant: 'destructive', Icon: ShieldX },
  timeout: { label: 'Tempo esgotado', variant: 'outline', Icon: ShieldAlert },
  not_required: { label: 'Não requerido', variant: 'outline', Icon: ShieldCheck },
};

function formatDecidedAt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
  } catch {
    return iso;
  }
}

export default function LiveViewPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const { status, error, metrics, consent, videoRef, start, stop, snapshot } = useLiveViewSession(agentId);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSnapshot = () => {
    const url = snapshot();
    if (!url) {
      toast.error('Vídeo indisponível para captura.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot-${Date.now()}.png`;
    a.click();
    toast.success('Snapshot salvo.');
  };

  const isLive = status === 'live';
  const consentMeta = CONSENT_META[consent.state];
  const ConsentIcon = consentMeta.Icon;

  return (
    <PageLayout>
      <PageHeader
        title="Visualização remota"
        description="Transmissão ao vivo do agente monitorado via WebRTC ponto a ponto."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/agents/onboarding">
              <ArrowLeft className="mr-2 size-4" /> Voltar
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden border-border/60">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-video w-full bg-black"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 text-xs text-white">
            <div className="flex items-center gap-2">
              <Badge
                variant={isLive ? 'destructive' : 'secondary'}
                className="pointer-events-auto uppercase tracking-wide"
              >
                <Radio className="mr-1 size-3 animate-pulse" />
                {STATUS_LABEL[status] ?? status}
              </Badge>
              <Badge variant={consentMeta.variant} className="pointer-events-auto uppercase tracking-wide">
                <ConsentIcon className="mr-1 size-3" />
                LGPD · {consentMeta.label}
              </Badge>
              {isLive && (
                <span className="rounded bg-black/40 px-2 py-1 backdrop-blur">
                  <Wifi className="mr-1 inline size-3" />
                  {metrics.latencyMs} ms · {metrics.fps} fps · {metrics.bitrateKbps} kbps
                </span>
              )}
            </div>
            <span className="rounded bg-black/40 px-2 py-1 backdrop-blur">Agente {agentId?.slice(0, 8)}…</span>
          </div>
        </div>

        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="text-sm text-muted-foreground">
            Uso restrito a administradores. Toda sessão é registrada em auditoria (LGPD).
          </div>
          <div className="flex flex-wrap gap-2">
            {!isLive && status !== 'authorizing' && status !== 'connecting' && status !== 'waiting_consent' && (
              <Button onClick={() => void start()} disabled={!agentId}>
                <Play className="mr-2 size-4" /> Iniciar sessão
              </Button>
            )}
            <Button variant="outline" onClick={handleSnapshot} disabled={!isLive}>
              <Camera className="mr-2 size-4" /> Snapshot
            </Button>
            <Button
              variant="destructive"
              onClick={() => void stop('user_stopped')}
              disabled={status === 'idle' || status === 'ended'}
            >
              <Power className="mr-2 size-4" /> Encerrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" /> Trilha de consentimento LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Estado</div>
            <div className="mt-1 flex items-center gap-2 font-medium">
              <ConsentIcon className="size-4" />
              {consentMeta.label}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Motivo informado</div>
            <div className="mt-1 font-medium">
              {consent.reason ?? (consent.state === 'pending' ? 'Aguardando decisão do colaborador…' : '—')}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Decidido em</div>
            <div className="mt-1 font-medium tabular-nums">{formatDecidedAt(consent.decidedAt)}</div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

