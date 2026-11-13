import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Coins, Recycle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';
import { useRecordingStorageCost } from '@/hooks/useRecordingStorageCost';
import { cn } from '@/lib/utils';

const GB = 1024 ** 3;

function formatGb(bytes: number): string {
  const gb = bytes / GB;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface RecordingStorageCostCardProps {
  className?: string;
}

export function RecordingStorageCostCard({ className }: RecordingStorageCostCardProps) {
  const [price, setPrice] = useState(0.12);
  const colors = useChartColors();
  const { usage, totals, isLoading } = useRecordingStorageCost(price);

  const chartData = usage.slice(0, 8).map((u) => ({
    name: u.companyName.length > 18 ? `${u.companyName.slice(0, 17)}…` : u.companyName,
    gb: Number((u.activeBytes / GB).toFixed(3)),
    custo: Number(u.monthlyCost.toFixed(2)),
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" aria-hidden="true" />
          Custo e armazenamento de gravações
        </CardTitle>
        <CardDescription>
          Rateio por empresa com base no volume ativo. Sessões expiradas já tiveram os vídeos
          removidos e contam como economia da política de retenção.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="storage-price">Preço por GB/mês (R$)</Label>
            <Input
              id="storage-price"
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Volume ativo</p>
            <p className="text-2xl font-semibold">{formatGb(totals.activeBytes)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Coins className="h-3 w-3" aria-hidden="true" /> Custo mensal estimado
            </p>
            <p className="text-2xl font-semibold">{formatBRL(totals.monthlyCost)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Recycle className="h-3 w-3" aria-hidden="true" /> Recuperado por retenção
            </p>
            <p className="text-2xl font-semibold">{formatGb(totals.reclaimedBytes)}</p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : usage.length === 0 ? (
          <EmptyState
            icon={HardDrive}
            title="Nenhuma gravação armazenada"
            description="Assim que o agente enviar trechos, o custo por empresa aparece aqui."
          />
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      color: colors.foreground,
                    }}
                    formatter={(value, name) =>
                      name === 'custo' ? formatBRL(Number(value ?? 0)) : `${value} GB`
                    }
                  />
                  <Bar dataKey="gb" name="gb" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ul className="divide-y divide-border rounded-lg border border-border">
              {usage.map((item) => (
                <li
                  key={item.companyId}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm odd:bg-muted/20 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sessions} sessões · {formatGb(item.activeBytes)} ativos ·{' '}
                      {formatGb(item.reclaimedBytes)} liberados
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.share.toFixed(1)}%</Badge>
                    <span className="font-semibold">{formatBRL(item.monthlyCost)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
