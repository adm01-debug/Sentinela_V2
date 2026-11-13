import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useChartColors } from '@/hooks/useChartColors';
import { CHANNEL_LABELS, TRANSFER_CHANNELS, type TransferChannel } from '@/hooks/useFileTransfers';
import { formatBytes, formatDay } from './format';
import { Activity, Upload } from 'lucide-react';

interface TopSender {
  label: string;
  bytes: number;
  events: number;
}

export interface FileTransferChartsProps {
  byChannelOverTime: Array<Record<string, string | number>>;
  topSenders: TopSender[];
  isLoading: boolean;
}

export function FileTransferCharts({
  byChannelOverTime,
  topSenders,
  isLoading,
}: FileTransferChartsProps) {
  const colors = useChartColors();

  const palette: Record<TransferChannel, string> = {
    usb: colors.destructive,
    browser_upload: colors.primary,
    browser_download: colors.info,
    cloud_sync: colors.accent,
    email_attach: colors.warning,
    network_share: colors.success,
    print: colors.muted,
  };

  const senderData = topSenders.map((s) => ({
    name: s.label.length > 16 ? `${s.label.slice(0, 15)}…` : s.label,
    bytes: s.bytes,
    events: s.events,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            Volume por canal
          </CardTitle>
          <CardDescription>Eventos de transferência por dia, separados por canal.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : byChannelOverTime.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Sem transferências no período"
              description="Ajuste o período ou os filtros para ver movimentações."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byChannelOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(v: string) => formatDay(v)}
                    tick={{ fill: colors.muted, fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: colors.muted, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      color: colors.foreground,
                    }}
                    labelFormatter={(v) => formatDay(String(v))}
                    formatter={(value, name) => [
                      value,
                      CHANNEL_LABELS[name as TransferChannel] ?? name,
                    ]}
                  />
                  {TRANSFER_CHANNELS.map((channel) => (
                    <Area
                      key={channel}
                      type="monotone"
                      dataKey={channel}
                      stackId="1"
                      stroke={palette[channel]}
                      fill={palette[channel]}
                      fillOpacity={0.25}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
            Maiores volumes de saída
          </CardTitle>
          <CardDescription>Colaboradores com maior volume enviado para fora.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : senderData.length === 0 ? (
            <EmptyState
              icon={Upload}
              title="Nenhuma saída registrada"
              description="Nenhum arquivo saiu do perímetro no período filtrado."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={senderData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v: number) => formatBytes(v)}
                    tick={{ fill: colors.muted, fontSize: 12 }}
                    width={78}
                  />
                  <Tooltip
                    contentStyle={{
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      color: colors.foreground,
                    }}
                    formatter={(value) => formatBytes(Number(value ?? 0))}
                  />
                  <Bar dataKey="bytes" name="Volume" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
