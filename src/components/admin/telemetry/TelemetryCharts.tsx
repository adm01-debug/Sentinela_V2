import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  severity: string;
  created_at: string;
}

interface Props {
  rows: TelemetryRow[];
  timeFilter: string;
}

function formatBucketTime(ts: number, timeFilter: string): string {
  const d = new Date(ts);
  if (timeFilter === "7d" || timeFilter === "custom") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function TelemetryCharts({ rows, timeFilter }: Props) {
  const bucketMs = useMemo(() => {
    if (timeFilter === "1h") return 5 * 60 * 1000;
    if (timeFilter === "6h") return 30 * 60 * 1000;
    if (timeFilter === "24h") return 60 * 60 * 1000;
    return 6 * 60 * 60 * 1000;
  }, [timeFilter]);

  // Timeline data (stacked area chart)
  const timelineData = useMemo(() => {
    if (rows.length === 0) return [];
    const buckets = new Map<number, { slow: number; very_slow: number; error: number }>();
    for (const r of rows) {
      const ts = new Date(r.created_at).getTime();
      const bucket = Math.floor(ts / bucketMs) * bucketMs;
      const prev = buckets.get(bucket) || { slow: 0, very_slow: 0, error: 0 };
      if (r.severity === "slow") prev.slow++;
      else if (r.severity === "very_slow") prev.very_slow++;
      else if (r.severity === "error") prev.error++;
      buckets.set(bucket, prev);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, counts]) => ({
        time: formatBucketTime(ts, timeFilter),
        muitoLentas: counts.very_slow,
        lentas: counts.slow,
        erros: counts.error,
      }));
  }, [rows, timeFilter, bucketMs]);

  // Duration avg/max per bucket
  const durationData = useMemo(() => {
    if (rows.length === 0) return [];
    const buckets = new Map<number, { totalMs: number; maxMs: number; count: number }>();
    for (const r of rows) {
      const ts = new Date(r.created_at).getTime();
      const bucket = Math.floor(ts / bucketMs) * bucketMs;
      const prev = buckets.get(bucket) || { totalMs: 0, maxMs: 0, count: 0 };
      buckets.set(bucket, {
        totalMs: prev.totalMs + r.duration_ms,
        maxMs: Math.max(prev.maxMs, r.duration_ms),
        count: prev.count + 1,
      });
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, data]) => ({
        time: formatBucketTime(ts, timeFilter),
        mediaMs: Math.round(data.totalMs / data.count),
        maxMs: data.maxMs,
      }));
  }, [rows, timeFilter, bucketMs]);

  // Severity distribution (pie chart)
  const severityDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const label = r.severity === "very_slow" ? "Muito Lentas" : r.severity === "slow" ? "Lentas" : r.severity === "error" ? "Erros" : r.severity;
      counts[label] = (counts[label] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rows]);

  // Alerts by table (horizontal bar chart)
  const tableAlertData = useMemo(() => {
    if (rows.length === 0) return [];
    const stats = new Map<string, number>();
    for (const r of rows) {
      const key = r.rpc_name || r.table_name || "unknown";
      stats.set(key, (stats.get(key) || 0) + 1);
    }
    return [...stats.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, alertas: count }));
  }, [rows]);

  const PIE_COLORS = ["hsl(45, 93%, 47%)", "hsl(var(--destructive))", "hsl(0, 84%, 60%)"];

  if (rows.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Row 1: Timeline + Severity Pie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timelineData}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="lentas" stackId="1" fill="hsl(45, 93%, 47%)" stroke="hsl(45, 93%, 47%)" fillOpacity={0.6} name="Lentas" />
                <Area type="monotone" dataKey="muitoLentas" stackId="1" fill="hsl(var(--destructive))" stroke="hsl(var(--destructive))" fillOpacity={0.6} name="Muito Lentas" />
                <Area type="monotone" dataKey="erros" stackId="1" fill="hsl(0, 84%, 60%)" stroke="hsl(0, 84%, 60%)" fillOpacity={0.6} name="Erros" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribuição por Severidade</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {severityDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Duration avg/max + Alerts by Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duração Média / Máxima (ms)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={durationData}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => `${value}ms`} />
                <Area type="monotone" dataKey="maxMs" fill="hsl(var(--destructive))" stroke="hsl(var(--destructive))" fillOpacity={0.2} name="Máxima" />
                <Area type="monotone" dataKey="mediaMs" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.4} name="Média" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas por Tabela</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tableAlertData} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={55} />
                <Tooltip />
                <Bar dataKey="alertas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Alertas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
