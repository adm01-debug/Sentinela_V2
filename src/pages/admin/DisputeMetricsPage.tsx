import { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock, Download, Gavel, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DisputeSlaAlertsCard } from '@/components/disputes/DisputeSlaAlertsCard';
import { exportDisputeMetricsPdf } from '@/utils/disputeMetricsPdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
} from 'recharts';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartColors } from '@/hooks/useChartColors';
import { useDisputeMetrics, DISPUTE_SLA_HOURS } from '@/hooks/useDisputeMetrics';
import {
  DISPUTE_CATEGORY_LABEL,
  DISPUTE_STATUS_LABEL,
  type DisputeCategory,
  type DisputeStatus,
} from '@/hooks/useViolationDisputes';

export default function DisputeMetricsPage() {
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const params = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString(),
    }),
    [from, to],
  );

  const { data, isLoading } = useDisputeMetrics(params);
  const colors = useChartColors();

  const complianceVariant = (pct: number) =>
    pct >= 90 ? 'default' : pct >= 70 ? 'secondary' : 'destructive';

  const statusData = useMemo(
    () =>
      data
        ? (Object.entries(data.byStatus) as [DisputeStatus, number][]).map(([k, v]) => ({
            name: DISPUTE_STATUS_LABEL[k] ?? k,
            value: v,
          }))
        : [],
    [data],
  );

  const categoryData = useMemo(
    () =>
      data
        ? Object.entries(data.byCategory).map(([k, v]) => ({
            name: DISPUTE_CATEGORY_LABEL[k as DisputeCategory] ?? k,
            value: v,
          }))
        : [],
    [data],
  );

  return (
    <PageLayout>
      <PageHeader
        title="Métricas de Contestação (SLA)"
        description={`Acompanhamento do SLA de ${DISPUTE_SLA_HOURS}h para julgamento formal de contestações LGPD.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={!data}
            onClick={() => data && exportDisputeMetricsPdf({ from: params.from, to: params.to, metrics: data })}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        }
      />

      <DisputeSlaAlertsCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Período</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">De</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Até</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<Gavel className="h-4 w-4" />}
              label="Total no período"
              value={String(data.total)}
              hint={`${data.pending} pendentes`}
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              label={`Compliance ${DISPUTE_SLA_HOURS}h`}
              value={`${data.slaCompliancePct.toFixed(1)}%`}
              badge={
                <Badge variant={complianceVariant(data.slaCompliancePct)}>
                  {data.resolvedWithinSla} on-time
                </Badge>
              }
            />
            <MetricCard
              icon={<Clock className="h-4 w-4" />}
              label="Tempo médio de julgamento"
              value={data.avgResolutionHours ? `${data.avgResolutionHours.toFixed(1)}h` : '—'}
              hint={data.p90ResolutionHours ? `p90: ${data.p90ResolutionHours.toFixed(1)}h` : ''}
            />
            <MetricCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Backlog fora de SLA"
              value={String(
                data.backlogAgeBuckets.find((b) => b.label === '72h-7d')!.count +
                  data.backlogAgeBuckets.find((b) => b.label === '>7d')!.count,
              )}
              hint="Pendentes > 72h"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Backlog por idade</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.backlogAgeBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="label" stroke={colors.muted} />
                    <YAxis stroke={colors.muted} />
                    <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="count" fill={colors.warning} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por status</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" stroke={colors.muted} />
                    <YAxis stroke={colors.muted} />
                    <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categorias contestadas</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis type="number" stroke={colors.muted} />
                    <YAxis type="category" dataKey="name" width={140} stroke={colors.muted} />
                    <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}` }} />
                    <Bar dataKey="value" fill={colors.accent} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Timeline (aberto vs julgado)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.muted} />
                    <YAxis stroke={colors.muted} />
                    <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}` }} />
                    <Legend />
                    <Line type="monotone" dataKey="created" name="Abertas" stroke={colors.primary} strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" name="Julgadas" stroke={colors.success} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </PageLayout>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {icon}
            {label}
          </div>
          {badge}
        </div>
        <div className="text-3xl font-semibold">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
