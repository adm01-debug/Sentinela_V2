import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import type { PolicyStats } from '@/hooks/usePolicyAcknowledgments';

interface PolicyStatsCardsProps {
  stats?: PolicyStats;
  isLoading?: boolean;
}

function PolicyStatsCardsComponent({ stats, isLoading }: PolicyStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Políticas Ativas',
      value: stats?.active_policies || 0,
      icon: ClipboardCheck,
      color: 'text-blue-600',
    },
    {
      title: 'Aceites Realizados',
      value: stats?.total_acknowledgments || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Pendentes',
      value: stats?.pending_acknowledgments || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    {
      title: 'Taxa de Conformidade',
      value: `${(stats?.compliance_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const PolicyStatsCards = memo(PolicyStatsCardsComponent);
