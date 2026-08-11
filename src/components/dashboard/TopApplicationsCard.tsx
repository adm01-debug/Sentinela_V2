import { useMemo } from 'react';
import { AppWindow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopApplications } from '@/hooks/useDashboard';

const CATEGORY_COLOR: Record<string, string> = {
  productive: 'bg-success',
  unproductive: 'bg-destructive',
  neutral: 'bg-muted-foreground',
  other: 'bg-primary',
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}min`;
};

interface TopApplicationsCardProps {
  limit?: number;
}

/**
 * Card com top aplicativos por tempo de uso nos últimos 7 dias.
 * Exibe barras horizontais normalizadas pelo maior valor.
 */
export const TopApplicationsCard = ({ limit = 8 }: TopApplicationsCardProps) => {
  const { data, isLoading } = useTopApplications(limit);

  const maxDuration = useMemo(
    () => Math.max(1, ...(data ?? []).map((a) => a.duration)),
    [data],
  );

  return (
    <Card className="lg:col-span-12">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AppWindow className="h-4 w-4 text-primary" aria-hidden="true" />
          Top aplicativos (7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Sem dados de aplicativos no período.
          </p>
        ) : (
          <ul className="space-y-2.5" aria-label="Aplicativos mais utilizados">
            {data.map((app) => {
              const pct = Math.max(2, Math.round((app.duration / maxDuration) * 100));
              const barColor = CATEGORY_COLOR[app.category] || CATEGORY_COLOR.other;
              return (
                <li key={app.name} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
                  <span className="truncate font-medium" title={app.name}>
                    {app.name}
                  </span>
                  <div
                    className="h-2 rounded-full bg-muted overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${app.name}: ${formatDuration(app.duration)}`}
                  >
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tabular-nums text-muted-foreground text-xs">
                    {formatDuration(app.duration)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TopApplicationsCard;
