import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

const SEVERITY_COLORS: Record<string, string> = {
  slow: "hsl(var(--warning))",
  very_slow: "hsl(var(--destructive))",
  error: "hsl(var(--destructive))",
};

export function TelemetryCharts({ rows, timeFilter }: Props) {
  const timelineData = useMemo(() => {
    if (rows.length === 0) return [];

    const bucketMs = timeFilter === "1h" ? 5 * 60 * 1000
      : timeFilter === "6h" ? 30 * 60 * 1000
      : timeFilter === "24h" ? 60 * 60 * 1000
      : 6 * 60 * 60 * 1000;

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
        time: new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        ...counts,
      }));
  }, [rows, timeFilter]);

  const severityDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.severity] = (counts[r.severity] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const PIE_COLORS = ["hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Alertas ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timelineData}>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="slow" stackId="a" fill="hsl(var(--warning))" name="Lentas" radius={[0, 0, 0, 0]} />
              <Bar dataKey="very_slow" stackId="a" fill="hsl(var(--destructive))" name="Muito Lentas" radius={[0, 0, 0, 0]} />
              <Bar dataKey="error" stackId="a" fill="hsl(var(--muted-foreground))" name="Erros" radius={[2, 2, 0, 0]} />
            </BarChart>
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
  );
}
