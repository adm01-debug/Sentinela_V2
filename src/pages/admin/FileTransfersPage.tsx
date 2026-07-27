import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, FileSymlink, ShieldAlert, HardDrive, Usb } from 'lucide-react';
import { FileTransferCharts } from '@/components/file-transfers/FileTransferCharts';
import { FileTransferTable } from '@/components/file-transfers/FileTransferTable';
import { formatBytes } from '@/components/file-transfers/format';
import {
  CHANNEL_LABELS,
  SENSITIVITY_LABELS,
  TRANSFER_CHANNELS,
  VERDICT_LABELS,
  useFileTransfers,
  type FileTransferFilters,
  type TransferChannel,
  type TransferSensitivity,
  type TransferVerdict,
} from '@/hooks/useFileTransfers';

const PERIODS = [1, 7, 30, 90];

export default function FileTransfersPage() {
  const [params, setParams] = useSearchParams();

  const filters: FileTransferFilters = {
    search: params.get('q') ?? '',
    channel: (params.get('channel') as TransferChannel | 'all') ?? 'all',
    verdict: (params.get('verdict') as TransferVerdict | 'all') ?? 'all',
    sensitivity: (params.get('sensitivity') as TransferSensitivity | 'all') ?? 'all',
    days: Number(params.get('days') ?? 7),
  };

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const { transfers, stats, byChannelOverTime, topSenders, isLoading, refetch } =
    useFileTransfers(filters);

  return (
    <PageLayout
      title="Transferências de Arquivos"
      subtitle="Rastreamento de movimentação de arquivos por USB, navegador, nuvem, e-mail e impressão"
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Atualizar
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileSymlink className="h-5 w-5 text-primary" aria-hidden="true" />}
          value={String(stats.total)}
          label="Eventos no período"
        />
        <StatCard
          icon={<HardDrive className="h-5 w-5 text-primary" aria-hidden="true" />}
          value={formatBytes(stats.outboundBytes)}
          label="Volume de saída"
        />
        <StatCard
          icon={<ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />}
          value={`${stats.blocked} / ${stats.flagged}`}
          label="Bloqueadas / sinalizadas"
        />
        <StatCard
          icon={<Usb className="h-5 w-5 text-primary" aria-hidden="true" />}
          value={String(stats.removableDevices)}
          label="Dispositivos USB distintos"
        />
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="ft-search">Busca</Label>
            <Input
              id="ft-search"
              value={filters.search}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Arquivo, domínio ou app"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-channel">Canal</Label>
            <Select value={filters.channel} onValueChange={(v) => update('channel', v)}>
              <SelectTrigger id="ft-channel">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {TRANSFER_CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CHANNEL_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-verdict">Veredito</Label>
            <Select value={filters.verdict} onValueChange={(v) => update('verdict', v)}>
              <SelectTrigger id="ft-verdict">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(VERDICT_LABELS) as TransferVerdict[]).map((v) => (
                  <SelectItem key={v} value={v}>
                    {VERDICT_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-sensitivity">Classificação</Label>
            <Select value={filters.sensitivity} onValueChange={(v) => update('sensitivity', v)}>
              <SelectTrigger id="ft-sensitivity">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {(Object.keys(SENSITIVITY_LABELS) as TransferSensitivity[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {SENSITIVITY_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-days">Período</Label>
            <Select value={String(filters.days)} onValueChange={(v) => update('days', v)}>
              <SelectTrigger id="ft-days">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    Últimos {d} {d === 1 ? 'dia' : 'dias'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <FileTransferCharts
        byChannelOverTime={byChannelOverTime}
        topSenders={topSenders}
        isLoading={isLoading}
      />

      <FileTransferTable transfers={transfers} isLoading={isLoading} />
    </PageLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
