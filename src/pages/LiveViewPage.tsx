import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Power, Radio, Wifi, Play } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLiveViewSession } from '@/hooks/useLiveViewSession';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, string> = {
  idle: 'Aguardando início',
  authorizing: 'Autorizando…',
  waiting_agent: 'Aguardando agente',
  connecting: 'Negociando conexão',
  live: 'AO VIVO',
  ended: 'Encerrada',
  error: 'Erro',
};

export default function LiveViewPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const { status, error, metrics, videoRef, start, stop, snapshot } = useLiveViewSession(agentId);

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

  return (
    <PageLayout>
      <PageHeader
        title="Visualização remota"
        description="Transmissão ao vivo do agente monitorado via WebRTC ponto a ponto."
        breadcrumbs={[
          { label: 'Agentes', href: '/agents/onboarding' },
          { label: 'Live view' },
        ]}
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
            {!isLive && status !== 'authorizing' && status !== 'connecting' && (
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
    </PageLayout>
  );
}
