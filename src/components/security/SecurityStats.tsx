import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock, type LucideIcon } from 'lucide-react';

interface SecurityStatsProps {
  total: number;
  critical: number;
  unresolved: number;
  today: number;
}

interface StatDef {
  key: keyof SecurityStatsProps;
  label: string;
  icon: LucideIcon;
  tone: 'muted' | 'destructive' | 'warning' | 'primary';
}

const STATS: readonly StatDef[] = [
  { key: 'total', label: 'Total de Eventos', icon: Shield, tone: 'muted' },
  { key: 'critical', label: 'Críticos', icon: AlertTriangle, tone: 'destructive' },
  { key: 'unresolved', label: 'Não Resolvidos', icon: Clock, tone: 'warning' },
  { key: 'today', label: 'Hoje', icon: CheckCircle, tone: 'primary' },
] as const;

const TONE_ICON: Record<StatDef['tone'], string> = {
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  warning: 'text-warning',
  primary: 'text-primary',
};

const TONE_VALUE: Record<StatDef['tone'], string> = {
  muted: '',
  destructive: 'text-destructive',
  warning: 'text-warning',
  primary: 'text-primary',
};

export const SecurityStats = React.memo(function SecurityStats(props: SecurityStatsProps) {
  return (
    <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-label="Estatísticas de segurança">
      {STATS.map(({ key, label, icon: Icon, tone }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <dt className="text-sm font-medium">{label}</dt>
            <Icon className={`h-4 w-4 ${TONE_ICON[tone]}`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <dd className={`text-2xl font-bold ${TONE_VALUE[tone]}`}>{props[key]}</dd>
          </CardContent>
        </Card>
      ))}
    </dl>
  );
});
