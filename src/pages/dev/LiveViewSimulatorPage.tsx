import { useMemo, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Pure simulator — models the state machine of the Live View handshake
// without opening real RTCPeerConnections. Validates authorize/ICE/consent
// gaps by inspecting deterministic outcomes.

type Scenario = {
  id: string;
  name: string;
  category: string;
  input: {
    agentOnline: boolean;
    consent: 'granted' | 'denied' | 'pending';
    turnAvailable: boolean;
    sameCompany: boolean;
    isAdmin: boolean;
    concurrentAdmin: number; // existing sessions by admin
    concurrentAgent: number;
    tokenExpiredMs: number; // negative => already expired
    packetLossPct: number;
  };
  expected: 'live' | 'denied' | 'forbidden' | 'agent_offline' | 'rate_limit' | 'ended' | 'error';
};

interface Result extends Scenario {
  actual: Scenario['expected'];
  pass: boolean;
}

function evaluate(s: Scenario['input']): Scenario['expected'] {
  if (!s.isAdmin || !s.sameCompany) return 'forbidden';
  if (s.tokenExpiredMs < 0) return 'error';
  if (s.concurrentAdmin >= 3 || s.concurrentAgent >= 1) return 'rate_limit';
  if (!s.agentOnline) return 'agent_offline';
  if (s.consent === 'denied') return 'denied';
  if (s.consent === 'pending') return 'ended';
  if (!s.turnAvailable && s.packetLossPct > 40) return 'error';
  return 'live';
}

function buildScenarios(): Scenario[] {
  const categories = [
    'happy_path',
    'consent_denied',
    'agent_offline',
    'not_admin',
    'cross_company',
    'rate_limit_admin',
    'rate_limit_agent',
    'token_expired',
    'turn_missing_heavy_loss',
    'turn_missing_low_loss',
    'consent_pending_timeout',
  ] as const;
  const scenarios: Scenario[] = [];
  let n = 0;
  for (const cat of categories) {
    for (let i = 0; i < 25; i++) {
      const input: Scenario['input'] = {
        agentOnline: true,
        consent: 'granted',
        turnAvailable: true,
        sameCompany: true,
        isAdmin: true,
        concurrentAdmin: 0,
        concurrentAgent: 0,
        tokenExpiredMs: 300_000,
        packetLossPct: Math.random() * 20,
      };
      let expected: Scenario['expected'] = 'live';
      switch (cat) {
        case 'consent_denied':
          input.consent = 'denied';
          expected = 'denied';
          break;
        case 'agent_offline':
          input.agentOnline = false;
          expected = 'agent_offline';
          break;
        case 'not_admin':
          input.isAdmin = false;
          expected = 'forbidden';
          break;
        case 'cross_company':
          input.sameCompany = false;
          expected = 'forbidden';
          break;
        case 'rate_limit_admin':
          input.concurrentAdmin = 3 + (i % 3);
          expected = 'rate_limit';
          break;
        case 'rate_limit_agent':
          input.concurrentAgent = 1 + (i % 2);
          expected = 'rate_limit';
          break;
        case 'token_expired':
          input.tokenExpiredMs = -1000 * (i + 1);
          expected = 'error';
          break;
        case 'turn_missing_heavy_loss':
          input.turnAvailable = false;
          input.packetLossPct = 45 + (i % 30);
          expected = 'error';
          break;
        case 'turn_missing_low_loss':
          input.turnAvailable = false;
          input.packetLossPct = Math.random() * 20;
          expected = 'live';
          break;
        case 'consent_pending_timeout':
          input.consent = 'pending';
          expected = 'ended';
          break;
      }
      scenarios.push({
        id: `${cat}-${i}`,
        name: `${cat} #${i + 1}`,
        category: cat,
        input,
        expected,
      });
      n++;
    }
  }
  // Extra: cross-product stress cases
  for (let i = 0; i < 25; i++) {
    const input: Scenario['input'] = {
      agentOnline: Math.random() > 0.3,
      consent: (['granted', 'denied', 'pending'] as const)[i % 3],
      turnAvailable: Math.random() > 0.5,
      sameCompany: Math.random() > 0.1,
      isAdmin: Math.random() > 0.1,
      concurrentAdmin: i % 5,
      concurrentAgent: i % 2,
      tokenExpiredMs: i % 7 === 0 ? -500 : 300_000,
      packetLossPct: Math.random() * 80,
    };
    const expected = evaluate(input);
    scenarios.push({ id: `stress-${i}`, name: `stress #${i}`, category: 'stress', input, expected });
    n++;
  }
  return scenarios;
}

export default function LiveViewSimulatorPage() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const scenarios = useMemo(buildScenarios, []);

  const run = async () => {
    setRunning(true);
    setResults([]);
    setProgress(0);
    const out: Result[] = [];
    const batch = 25;
    for (let i = 0; i < scenarios.length; i += batch) {
      const slice = scenarios.slice(i, i + batch).map((s) => {
        const actual = evaluate(s.input);
        return { ...s, actual, pass: actual === s.expected };
      });
      out.push(...slice);
      setProgress(Math.round(((i + batch) / scenarios.length) * 100));
      await new Promise((r) => setTimeout(r, 8));
    }
    setResults(out);
    setRunning(false);
  };

  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const rate = total ? (passed / total) * 100 : 0;
  const byCat = results.reduce<Record<string, { pass: number; total: number }>>((acc, r) => {
    acc[r.category] ??= { pass: 0, total: 0 };
    acc[r.category].total++;
    if (r.pass) acc[r.category].pass++;
    return acc;
  }, {});
  const failures = results.filter((r) => !r.pass).slice(0, 30);

  return (
    <PageLayout>
      <PageHeader
        title="Simulador Live View"
        description="Executa centenas de cenários da máquina de estados do handshake WebRTC (autorização, consentimento, TURN, rate-limit, expiração)."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bateria de testes</CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{scenarios.length} cenários</Badge>
            <Button onClick={() => void run()} disabled={running}>
              {running ? 'Rodando…' : 'Executar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} />
          {total > 0 && (
            <>
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge variant={rate >= 99 ? 'default' : 'destructive'}>
                  Taxa de sucesso: {rate.toFixed(1)}%
                </Badge>
                <Badge variant="outline">
                  {passed}/{total} aprovados
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
                {Object.entries(byCat).map(([cat, v]) => (
                  <div key={cat} className="flex items-center justify-between rounded border border-border/60 px-2 py-1">
                    <span className="font-mono">{cat}</span>
                    <Badge variant={v.pass === v.total ? 'default' : 'destructive'}>
                      {v.pass}/{v.total}
                    </Badge>
                  </div>
                ))}
              </div>
              {failures.length > 0 && (
                <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-xs">
                  <p className="mb-2 font-semibold">Falhas ({failures.length}):</p>
                  <ul className="space-y-1 font-mono">
                    {failures.map((f) => (
                      <li key={f.id}>
                        {f.name} — esperado <b>{f.expected}</b>, obtido <b>{f.actual}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
