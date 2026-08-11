import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, WifiOff, XCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
  label: string;
}

interface IceConfig {
  stun_servers: IceServer[];
  turn_servers: IceServer[];
  turn_configured: boolean;
  turn_error: string | null;
}

type ProbeStatus = 'idle' | 'running' | 'ok' | 'partial' | 'failed';
type CandidateKind = 'host' | 'srflx' | 'prflx' | 'relay';

interface ProbeResult {
  label: string;
  kind: 'stun' | 'turn';
  urls: string;
  status: ProbeStatus;
  candidates: Record<CandidateKind, number>;
  durationMs: number;
  error?: string;
}

const EMPTY_COUNTS: Record<CandidateKind, number> = { host: 0, srflx: 0, prflx: 0, relay: 0 };

async function probeServer(server: IceServer, kind: 'stun' | 'turn'): Promise<ProbeResult> {
  const t0 = performance.now();
  const label = server.label;
  const urls = Array.isArray(server.urls) ? server.urls.join(', ') : server.urls;
  const counts: Record<CandidateKind, number> = { ...EMPTY_COUNTS };
  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: server.urls, username: server.username, credential: server.credential }],
      iceTransportPolicy: kind === 'turn' ? 'relay' : 'all',
    });
    pc.createDataChannel('probe');
    const done = new Promise<void>((resolve) => {
      const finish = () => resolve();
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') finish();
      };
      pc.onicecandidate = (ev) => {
        const c = ev.candidate;
        if (!c) return finish();
        const type = (c.type ?? 'host') as CandidateKind;
        counts[type] = (counts[type] ?? 0) + 1;
      };
      setTimeout(finish, 6000);
    });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await done;
    pc.close();
    const dur = Math.round(performance.now() - t0);
    let status: ProbeStatus;
    if (kind === 'stun') {
      status = counts.srflx > 0 ? 'ok' : counts.host > 0 ? 'partial' : 'failed';
    } else {
      status = counts.relay > 0 ? 'ok' : 'failed';
    }
    return { label, kind, urls, status, candidates: counts, durationMs: dur };
  } catch (e) {
    return {
      label,
      kind,
      urls,
      status: 'failed',
      candidates: counts,
      durationMs: Math.round(performance.now() - t0),
      error: (e as Error).message,
    };
  }
}

export default function IceDiagnosticsPage() {
  const [config, setConfig] = useState<IceConfig | null>(null);
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [running, setRunning] = useState(false);

  const loadConfig = async () => {
    setLoadingCfg(true);
    const { data, error } = await supabase.functions.invoke<IceConfig>('webrtc-ice-config');
    if (error || !data) {
      toast.error(error?.message ?? 'Falha ao carregar configuração');
      setLoadingCfg(false);
      return;
    }
    setConfig(data);
    setLoadingCfg(false);
  };

  const runProbes = async () => {
    if (!config) return;
    setRunning(true);
    setResults([]);
    const jobs: Array<Promise<ProbeResult>> = [
      ...config.stun_servers.map((s) => probeServer(s, 'stun')),
      ...config.turn_servers.map((s) => probeServer(s, 'turn')),
    ];
    const settled = await Promise.all(jobs);
    setResults(settled);
    setRunning(false);
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const relayOk = results.some((r) => r.kind === 'turn' && r.status === 'ok');
  const stunOk = results.some((r) => r.kind === 'stun' && r.status === 'ok');
  const turnFailed = results.some((r) => r.kind === 'turn' && r.status === 'failed');

  return (
    <PageLayout>
      <PageHeader
        title="Diagnóstico STUN / TURN"
        description="Valida a conectividade dos servidores usados pela visualização remota (Live View) via WebRTC."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadConfig()} disabled={loadingCfg}>
              <RefreshCw className={`mr-2 size-4 ${loadingCfg ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
            <Button size="sm" onClick={() => void runProbes()} disabled={running || !config}>
              {running ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {running ? 'Testando…' : 'Executar teste'}
            </Button>
          </div>
        }
      />

      {config && !config.turn_configured && (
        <Alert variant="default" className="border-warning/40 bg-warning/5">
          <AlertTriangle className="size-4" />
          <AlertTitle>TURN não configurado</AlertTitle>
          <AlertDescription className="space-y-2 text-sm">
            <p>
              O segredo <code>TURN_CREDENTIALS</code> não está definido. Sem TURN, redes
              corporativas com NAT simétrico ou firewalls estritos não conseguirão receber
              a transmissão do agente.
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Crie uma conta em <b>Metered.ca</b>, <b>Cloudflare Calls</b> ou <b>Twilio</b>{' '}
                para obter servidores TURN gerenciados.
              </li>
              <li>
                Copie a lista de servidores no formato JSON, ex:
                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">{`[
  { "urls": "turn:global.turn.example:3478", "username": "user", "credential": "pass" },
  { "urls": "turns:global.turn.example:5349?transport=tcp", "username": "user", "credential": "pass" }
]`}</pre>
              </li>
              <li>
                Adicione o segredo <code>TURN_CREDENTIALS</code> nas configurações do backend
                com esse JSON.
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {config?.turn_error && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>TURN_CREDENTIALS malformado</AlertTitle>
          <AlertDescription>
            {config.turn_error}. Corrija o JSON e recarregue.
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          <StatusCard label="STUN" ok={stunOk} desc="Descoberta de IP público" />
          <StatusCard label="TURN" ok={relayOk} desc="Relay para redes restritivas" />
          <StatusCard
            label="Live View pronto"
            ok={stunOk && (!config?.turn_configured || relayOk)}
            desc="Conectividade mínima atendida"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servidores configurados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {config?.stun_servers.concat(config.turn_servers).map((s) => {
            const key = Array.isArray(s.urls) ? s.urls.join(',') : s.urls;
            const result = results.find((r) => r.urls === (Array.isArray(s.urls) ? s.urls.join(', ') : s.urls));
            return (
              <div
                key={key}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    {result ? <StatusIcon status={result.status} /> : <WifiOff className="size-4 text-muted-foreground" />}
                    {s.label}
                    <Badge variant="outline" className="font-mono text-xs">
                      {Array.isArray(s.urls) ? s.urls[0] : s.urls}
                    </Badge>
                  </div>
                  {result && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      host: {result.candidates.host} · srflx: {result.candidates.srflx} · relay: {result.candidates.relay} · {result.durationMs} ms
                      {result.error ? ` · erro: ${result.error}` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {!config && loadingCfg && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Carregando configuração…
            </div>
          )}
        </CardContent>
      </Card>

      {turnFailed && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>TURN falhou em obter candidato relay</AlertTitle>
          <AlertDescription>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Verifique se as credenciais em <code>TURN_CREDENTIALS</code> estão ativas e não expiraram.</li>
              <li>Confirme se o firewall corporativo libera as portas 3478/UDP e 5349/TCP.</li>
              <li>Prefira URLs com <code>turns:</code> (TLS) para redes que bloqueiam UDP.</li>
              <li>Se o provedor usa credenciais efêmeras, gere-as via edge function em vez de armazenar estáticas.</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </PageLayout>
  );
}

function StatusCard({ label, ok, desc }: { label: string; ok: boolean; desc: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase text-muted-foreground">{label}</div>
          <div className="text-sm font-medium">{desc}</div>
        </div>
        {ok ? (
          <CheckCircle2 className="size-6 text-success" />
        ) : (
          <XCircle className="size-6 text-destructive" />
        )}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: ProbeStatus }) {
  if (status === 'ok') return <CheckCircle2 className="size-4 text-success" />;
  if (status === 'partial') return <AlertTriangle className="size-4 text-warning" />;
  if (status === 'failed') return <XCircle className="size-4 text-destructive" />;
  return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
}
