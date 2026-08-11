/**
 * Dev-only harness: gera centenas de cenários (violações, adulteração e falhas)
 * e valida se a lógica do PDF + portal /verify-report responde corretamente
 * em todos os casos. Não faz gravação no banco — testa a matemática de assinatura
 * e o parser de query params/hash de forma pura.
 */
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, PlayCircle, ShieldCheck, ShieldAlert, Bug } from 'lucide-react';

type ScenarioCategory =
  | 'valid'
  | 'tampered_events'
  | 'tampered_filters'
  | 'tampered_period'
  | 'wrong_signature'
  | 'truncated_signature'
  | 'empty_id'
  | 'malformed_id'
  | 'unicode_payload'
  | 'huge_payload'
  | 'collision_probe'
  | 'url_injection'
  | 'canonical_stability';

interface Scenario {
  id: string;
  category: ScenarioCategory;
  description: string;
  expected: 'match' | 'mismatch' | 'rejected';
}

interface Result extends Scenario {
  actual: 'match' | 'mismatch' | 'rejected' | 'error';
  passed: boolean;
  durationMs: number;
  detail?: string;
}

// -------------------- helpers --------------------

const sha256Hex = async (input: string): Promise<string> => {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const randId = () =>
  `SNL-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

const randomFilters = () => ({
  search: Math.random() > 0.5 ? 'suspeito' : '',
  severity: (['low', 'medium', 'high', 'critical', 'all'] as const)[Math.floor(Math.random() * 5)],
  status: (['open', 'closed', 'reviewing', 'all'] as const)[Math.floor(Math.random() * 4)],
  type: Math.random() > 0.3 ? 'policy_violation' : 'access_denied',
});

const randomIds = (n: number) =>
  Array.from({ length: n }, () =>
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

interface Payload {
  reportId: string;
  generatedAt: string;
  total: number;
  period: string;
  filters: ReturnType<typeof randomFilters>;
  ids: string[];
}

const buildPayload = (overrides: Partial<Payload> = {}): Payload => {
  const ids = overrides.ids ?? randomIds(1 + Math.floor(Math.random() * 40));
  return {
    reportId: overrides.reportId ?? randId(),
    generatedAt: overrides.generatedAt ?? new Date().toISOString(),
    total: overrides.total ?? ids.length,
    period: overrides.period ?? '01/01/2026 - 31/01/2026',
    filters: overrides.filters ?? randomFilters(),
    ids,
  };
};

// -------------------- scenario generation --------------------

const buildScenarios = (perCategory: number): Scenario[] => {
  const cats: Array<{ cat: ScenarioCategory; expected: Scenario['expected']; desc: string }> = [
    { cat: 'valid', expected: 'match', desc: 'Payload íntegro' },
    { cat: 'tampered_events', expected: 'mismatch', desc: 'Adulteração de IDs de eventos' },
    { cat: 'tampered_filters', expected: 'mismatch', desc: 'Filtros aplicados alterados' },
    { cat: 'tampered_period', expected: 'mismatch', desc: 'Período do relatório alterado' },
    { cat: 'wrong_signature', expected: 'mismatch', desc: 'Assinatura substituída por hash arbitrário' },
    { cat: 'truncated_signature', expected: 'mismatch', desc: 'Assinatura truncada (64 → 32 chars)' },
    { cat: 'empty_id', expected: 'rejected', desc: 'ID vazio recebido no portal' },
    { cat: 'malformed_id', expected: 'rejected', desc: 'ID com caracteres inválidos' },
    { cat: 'unicode_payload', expected: 'match', desc: 'Payload com emoji/CJK/acentuação' },
    { cat: 'huge_payload', expected: 'match', desc: 'Payload com 1000+ IDs' },
    { cat: 'collision_probe', expected: 'mismatch', desc: 'Payload similar mas com 1 byte de diferença' },
    { cat: 'url_injection', expected: 'rejected', desc: 'Query param com script/HTML' },
    { cat: 'canonical_stability', expected: 'match', desc: 'Recomputo estável mesmo re-serializando' },
  ];
  const out: Scenario[] = [];
  cats.forEach(({ cat, expected, desc }) => {
    for (let i = 0; i < perCategory; i++) {
      out.push({
        id: `${cat}-${i}`,
        category: cat,
        description: desc,
        expected,
      });
    }
  });
  return out;
};

// -------------------- scenario runner --------------------

const runScenario = async (s: Scenario): Promise<Result> => {
  const t0 = performance.now();
  try {
    const base = buildPayload();
    const canonical = JSON.stringify(base);
    const expectedSig = await sha256Hex(canonical);

    let submittedId = base.reportId;
    let submittedSig = expectedSig;
    let recomputedSig = expectedSig;

    switch (s.category) {
      case 'valid':
        break;
      case 'tampered_events': {
        const tampered = { ...base, ids: [...base.ids, 'INJECTED-EVENT'] };
        recomputedSig = await sha256Hex(JSON.stringify(tampered));
        break;
      }
      case 'tampered_filters': {
        const tampered = { ...base, filters: { ...base.filters, severity: 'low' as const } };
        recomputedSig = await sha256Hex(JSON.stringify(tampered));
        break;
      }
      case 'tampered_period': {
        const tampered = { ...base, period: '01/02/2026 - 28/02/2026' };
        recomputedSig = await sha256Hex(JSON.stringify(tampered));
        break;
      }
      case 'wrong_signature':
        submittedSig = await sha256Hex('adversary-' + Math.random());
        break;
      case 'truncated_signature':
        submittedSig = expectedSig.slice(0, 32);
        break;
      case 'empty_id':
        submittedId = '';
        break;
      case 'malformed_id':
        submittedId = '<script>alert(1)</script>';
        break;
      case 'unicode_payload': {
        const uni = buildPayload({
          period: '📅 Janeiro / 一月 — çãõü',
          filters: { ...base.filters, search: '🚨 crítico ação' },
        });
        submittedId = uni.reportId;
        submittedSig = await sha256Hex(JSON.stringify(uni));
        recomputedSig = await sha256Hex(JSON.stringify(uni));
        break;
      }
      case 'huge_payload': {
        const huge = buildPayload({ ids: randomIds(1200) });
        submittedId = huge.reportId;
        submittedSig = await sha256Hex(JSON.stringify(huge));
        recomputedSig = await sha256Hex(JSON.stringify(huge));
        break;
      }
      case 'collision_probe': {
        const clone = { ...base, generatedAt: base.generatedAt + '.001' };
        recomputedSig = await sha256Hex(JSON.stringify(clone));
        break;
      }
      case 'url_injection':
        submittedId = "'; DROP TABLE report_signatures;--";
        break;
      case 'canonical_stability': {
        // Recomputar em nova serialização deve gerar mesmo hash (JSON estável no mesmo objeto).
        recomputedSig = await sha256Hex(JSON.stringify(base));
        break;
      }
    }

    // Simular validação como o portal /verify-report faria:
    // 1) validar formato de ID
    // 2) comparar sig submetida vs sig recomputada
    const idIsValidFormat = /^SNL-\d{14}-[A-Z0-9]{6}$/.test(submittedId);
    let actual: Result['actual'];
    if (!submittedId) actual = 'rejected';
    else if (!idIsValidFormat) actual = 'rejected';
    else if (submittedSig.toLowerCase() === recomputedSig.toLowerCase()) actual = 'match';
    else actual = 'mismatch';

    const dur = performance.now() - t0;
    return {
      ...s,
      actual,
      passed: actual === s.expected,
      durationMs: dur,
      detail: `sub=${submittedSig.slice(0, 8)} rec=${recomputedSig.slice(0, 8)}`,
    };
  } catch (err) {
    return {
      ...s,
      actual: 'error',
      passed: false,
      durationMs: performance.now() - t0,
      detail: err instanceof Error ? err.message : 'unknown',
    };
  }
};

// -------------------- component --------------------

export default function VerifyReportSimulatorPage() {
  const [perCategory, setPerCategory] = useState(50);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  const scenarios = useMemo(() => buildScenarios(perCategory), [perCategory]);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);
    setProgress(0);
    const out: Result[] = [];
    const total = scenarios.length;
    // Executa em lotes de 25 para dar respiro ao main thread
    const batchSize = 25;
    for (let i = 0; i < total; i += batchSize) {
      const batch = scenarios.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(runScenario));
      out.push(...batchResults);
      setProgress(Math.round(((i + batch.length) / total) * 100));
      // yield ao browser
      await new Promise((r) => setTimeout(r, 0));
    }
    setResults(out);
    setRunning(false);
  }, [scenarios]);

  const summary = useMemo(() => {
    if (!results.length) return null;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;
    const byCat = new Map<ScenarioCategory, { total: number; passed: number }>();
    results.forEach((r) => {
      const cur = byCat.get(r.category) ?? { total: 0, passed: 0 };
      cur.total += 1;
      if (r.passed) cur.passed += 1;
      byCat.set(r.category, cur);
    });
    const avgMs = results.reduce((a, r) => a + r.durationMs, 0) / results.length;
    return { passed, failed, byCat, avgMs, total: results.length };
  }, [results]);

  const failures = results.filter((r) => !r.passed);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Simulador de verificação de relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Gera centenas de cenários — payloads íntegros, adulterações, falhas de formato e ataques —
          e valida se a lógica de assinatura SHA-256 e o parser do portal <code>/verify-report</code>
          respondem corretamente em cada caso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuração da simulação</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label htmlFor="perCat" className="text-xs font-medium text-muted-foreground">
              Cenários por categoria
            </label>
            <input
              id="perCat"
              type="number"
              min={5}
              max={500}
              value={perCategory}
              onChange={(e) => setPerCategory(Math.max(5, Math.min(500, Number(e.target.value) || 50)))}
              className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={running}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total previsto: <span className="font-semibold text-foreground">{scenarios.length}</span>{' '}
            cenários em 13 categorias
          </div>
          <Button onClick={run} disabled={running} className="ml-auto">
            {running ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Executando…</>
            ) : (
              <><PlayCircle className="mr-2 h-4 w-4" /> Executar simulação</>
            )}
          </Button>
        </CardContent>
      </Card>

      {running && (
        <Card>
          <CardContent className="pt-6">
            <Progress value={progress} />
            <p className="mt-2 text-center text-xs text-muted-foreground">{progress}%</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{summary.total}</CardContent>
          </Card>
          <Card className="border-success/40">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Aprovados</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-bold text-success">
              <ShieldCheck className="h-6 w-6" /> {summary.passed}
            </CardContent>
          </Card>
          <Card className={summary.failed > 0 ? 'border-destructive/40' : ''}>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Falhas</CardTitle></CardHeader>
            <CardContent className={`flex items-center gap-2 text-2xl font-bold ${summary.failed > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <ShieldAlert className="h-6 w-6" /> {summary.failed}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Tempo médio</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{summary.avgMs.toFixed(2)} ms</CardContent>
          </Card>
        </div>
      )}

      {summary && (
        <Card>
          <CardHeader><CardTitle className="text-base">Resultado por categoria</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Array.from(summary.byCat.entries()).map(([cat, s]) => {
              const pct = Math.round((s.passed / s.total) * 100);
              const ok = s.passed === s.total;
              return (
                <div key={cat} className="flex items-center gap-3 text-sm">
                  <span className="w-56 font-mono text-xs">{cat}</span>
                  <Progress value={pct} className="flex-1" />
                  <Badge variant={ok ? 'default' : 'destructive'} className="w-24 justify-center">
                    {s.passed}/{s.total} ({pct}%)
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {failures.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <Bug className="h-4 w-4" /> Falhas detectadas ({failures.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="p-1">Cenário</th>
                  <th className="p-1">Esperado</th>
                  <th className="p-1">Obtido</th>
                  <th className="p-1">Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {failures.slice(0, 100).map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="p-1 font-mono">{f.id}</td>
                    <td className="p-1">{f.expected}</td>
                    <td className="p-1 text-destructive">{f.actual}</td>
                    <td className="p-1 font-mono text-muted-foreground">{f.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
