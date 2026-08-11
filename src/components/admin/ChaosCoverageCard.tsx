import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, FlaskConical, HelpCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Matriz de cobertura de Chaos Engineering do canal de fallback.
 * Lê `edge_function_logs` (function_name = 'slack-fallback-test') e cruza os
 * cenários executados com o catálogo completo, expondo gaps não testados.
 */

type ChaosMode = 'real' | 'timeout' | 'error_429' | 'error_500' | 'partial_failure';

const SCENARIOS: Array<{ mode: ChaosMode; label: string; description: string }> = [
  { mode: 'real', label: 'Envio real', description: 'Entrega efetiva via Resend' },
  { mode: 'timeout', label: 'Timeout', description: 'Upstream sem resposta (8s)' },
  { mode: 'error_429', label: 'Rate limit 429', description: 'Provedor recusa por excesso' },
  { mode: 'error_500', label: 'Erro 500', description: 'Falha interna do provedor' },
  { mode: 'partial_failure', label: 'Falha parcial', description: 'Parte dos destinatários rejeitada' },
];

/** Janela de validade de um cenário: após isso, a cobertura é considerada obsoleta. */
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

interface ChaosLog {
  id: string;
  created_at: string;
  status: number | null;
  duration_ms: number | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

interface ScenarioResult {
  mode: ChaosMode;
  label: string;
  description: string;
  runs: number;
  lastRunAt: string | null;
  lastOk: boolean | null;
  avgDurationMs: number | null;
  stale: boolean;
}

function coerceMode(payload_summary: Record<string, unknown> | null): ChaosMode | null {
  const raw = payload_summary?.mode;
  if (typeof raw !== 'string') return null;
  return SCENARIOS.some((s) => s.mode === raw) ? (raw as ChaosMode) : null;
}

export function ChaosCoverageCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['chaos-coverage'],
    queryFn: async (): Promise<ScenarioResult[]> => {
      const { data, error } = await supabase
        .from('edge_function_logs')
        .select('id, created_at, status, duration_ms, error_message, payload_summary')
        .eq('function_name', 'slack-fallback-test')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const logs = (data ?? []) as ChaosLog[];
      const now = Date.now();

      return SCENARIOS.map((scenario) => {
        const matching = logs.filter((l) => coerceMode(l.payload_summary) === scenario.mode);
        const last = matching[0] ?? null;
        const durations = matching
          .map((l) => l.duration_ms)
          .filter((d): d is number => typeof d === 'number' && d >= 0);

        return {
          ...scenario,
          runs: matching.length,
          lastRunAt: last?.created_at ?? null,
          lastOk: last ? (last.status ?? 500) < 300 : null,
          avgDurationMs: durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : null,
          stale: last ? now - new Date(last.created_at).getTime() > STALE_AFTER_MS : false,
        };
      });
    },
    refetchInterval: 60_000,
  });

  const covered = data?.filter((s) => s.runs > 0 && !s.stale).length ?? 0;
  const coveragePct = Math.round((covered / SCENARIOS.length) * 100);
  const gaps = data?.filter((s) => s.runs === 0) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Cobertura de Chaos Engineering
        </CardTitle>
        <CardDescription>
          Cenários de falha já exercitados no canal de fallback e gaps ainda não validados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cobertura de cenários</span>
                <span className="font-medium">
                  {covered}/{SCENARIOS.length} ({coveragePct}%)
                </span>
              </div>
              <Progress value={coveragePct} aria-label="Cobertura de cenários de caos" />
            </div>

            <ul className="space-y-2">
              {data.map((s) => (
                <li
                  key={s.mode}
                  className="flex items-start justify-between gap-3 rounded-md border p-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {s.runs === 0 ? (
                        <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      ) : s.lastOk ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                      )}
                      <span className="font-medium">{s.label}</span>
                      {s.runs === 0 && (
                        <Badge variant="outline" className="text-xs">
                          não testado
                        </Badge>
                      )}
                      {s.stale && (
                        <Badge variant="outline" className="border-warning/40 text-xs text-warning">
                          obsoleto
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-muted-foreground">
                    <div>{s.runs} execução(ões)</div>
                    {s.lastRunAt && (
                      <div>
                        {formatDistanceToNow(new Date(s.lastRunAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    )}
                    {s.avgDurationMs !== null && <div>~{s.avgDurationMs}ms</div>}
                  </div>
                </li>
              ))}
            </ul>

            {gaps.length > 0 && (
              <p className="rounded-md border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
                Gap de resiliência: {gaps.map((g) => g.label).join(', ')} ainda sem execução
                registrada. Rode o teste no card de fallback para validar o comportamento.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
