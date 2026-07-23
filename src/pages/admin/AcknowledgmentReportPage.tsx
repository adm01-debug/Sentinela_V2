import { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { Download, FileText, ShieldCheck, Clock, BellOff, TrendingUp } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAcknowledgmentReport,
  formatAckDuration,
} from '@/hooks/useAcknowledgmentReport';
import {
  exportAcknowledgmentCsv,
  exportAcknowledgmentPdf,
} from '@/utils/acknowledgmentReportPdf';

export default function AcknowledgmentReportPage() {
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employee, setEmployee] = useState('');

  const params = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString(),
      employee: employee.trim() || null,
    }),
    [from, to, employee],
  );

  const { data, isLoading } = useAcknowledgmentReport(params);

  const rateVariant = (rate: number, notified: number) => {
    if (notified === 0) return 'outline';
    if (rate >= 90) return 'default';
    if (rate >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <PageLayout>
      <PageHeader
        title="Relatório de Ciência LGPD"
        description="Taxa de reconhecimento das violações por colaborador com trilha assinada."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="from">De</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">Até</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp">Colaborador (opcional)</Label>
            <Input
              id="emp"
              placeholder="Nome exato"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              disabled={!data || data.rows.length === 0}
              onClick={() => data && exportAcknowledgmentCsv(data)}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button
              disabled={!data || data.rows.length === 0}
              onClick={() => data && exportAcknowledgmentPdf(data, params)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total de violações"
          value={isLoading ? null : data?.totals.total ?? 0}
          tone="text-foreground"
        />
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Ciência confirmada"
          value={isLoading ? null : data?.totals.acknowledged ?? 0}
          tone="text-success"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Aguardando ciência"
          value={isLoading ? null : data?.totals.pending ?? 0}
          tone="text-warning"
        />
        <StatCard
          icon={<BellOff className="h-4 w-4" />}
          label="Sem notificação"
          value={isLoading ? null : data?.totals.notNotified ?? 0}
          tone="text-muted-foreground"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranking por colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data || data.perEmployee.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma violação no período selecionado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Notif.</TableHead>
                  <TableHead className="text-right">Ciência</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Tempo médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.perEmployee.map((e) => (
                  <TableRow key={e.employee}>
                    <TableCell className="font-medium">{e.employee}</TableCell>
                    <TableCell className="text-right">{e.total}</TableCell>
                    <TableCell className="text-right">{e.notified}</TableCell>
                    <TableCell className="text-right text-success">{e.acknowledged}</TableCell>
                    <TableCell className="text-right text-warning">{e.pending}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={rateVariant(e.ackRate, e.notified)}>
                        {e.notified === 0 ? '—' : `${e.ackRate.toFixed(1)}%`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatAckDuration(e.avgAckSeconds)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className={`mt-2 text-2xl font-bold ${tone}`}>
          {value === null ? <Skeleton className="h-8 w-16" /> : value.toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}
