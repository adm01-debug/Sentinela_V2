import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Zap, Database } from "lucide-react";

interface TelemetryStatsProps {
  verySlow: number;
  slow: number;
  errors: number;
  avgDuration: string;
}

export function TelemetryStatsCards({ verySlow, slow, errors, avgDuration }: TelemetryStatsProps) {
  const cards = [
    { icon: AlertTriangle, color: 'bg-destructive/10', iconColor: 'text-destructive', value: verySlow, label: 'Muito Lentas (>8s)' },
    { icon: Clock, color: 'bg-warning/10', iconColor: 'text-warning', value: slow, label: 'Lentas (>3s)' },
    { icon: Zap, color: 'bg-destructive/10', iconColor: 'text-destructive', value: errors, label: 'Erros' },
    { icon: Database, color: 'bg-primary/10', iconColor: 'text-primary', value: avgDuration, label: 'Média de duração' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${c.color}`}>
              <c.icon className={`h-5 w-5 ${c.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface TopOffender {
  name: string;
  count: number;
  maxMs: number;
  avgMs: number;
}

interface TopOffendersCardProps {
  offenders: TopOffender[];
  formatDuration: (ms: number) => string;
}

export function TopOffendersCard({ offenders, formatDuration }: TopOffendersCardProps) {
  if (offenders.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4" />
          Tabelas Mais Problemáticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {offenders.map((o) => (
            <div key={o.name} className="p-3 rounded-lg border border-border/50 bg-muted/30">
              <p className="font-mono text-sm font-medium truncate" title={o.name}>{o.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{o.count}× alertas</span>
                <span className="text-xs text-destructive">max {formatDuration(o.maxMs)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                média: {formatDuration(o.avgMs)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function getSeverityBadge(severity: string) {
  switch (severity) {
    case "very_slow":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">🔴 Muito Lenta</Badge>;
    case "slow":
      return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">🟡 Lenta</Badge>;
    case "error":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">❌ Erro</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{severity}</Badge>;
  }
}
