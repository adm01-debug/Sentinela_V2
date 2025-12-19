import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Clock, Award, AlertTriangle } from 'lucide-react';
import type { ProductivityStats } from '@/hooks/useProductivityComparison';

interface ProductivityStatsCardsProps {
  stats?: ProductivityStats;
  isLoading?: boolean;
}

function ProductivityStatsCardsComponent({ stats, isLoading }: ProductivityStatsCardsProps) {
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
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Produtividade Média',
      value: `${stats?.average_score || 0}%`,
      subtext: `Tendência: ${stats?.productivity_trend || 0}%`,
      icon: stats?.productivity_trend && stats.productivity_trend > 0 ? TrendingUp : TrendingDown,
      color: (stats?.average_score || 0) >= 70 ? 'text-green-600' : 'text-orange-600',
    },
    {
      title: 'Melhor Desempenho',
      value: stats?.top_performer || '-',
      subtext: 'Top performer',
      icon: Award,
      color: 'text-yellow-600',
    },
    {
      title: 'Tempo Ativo Total',
      value: `${stats?.total_active_hours || 0}h`,
      subtext: `${stats?.total_idle_hours || 0}h tempo ocioso`,
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Menor Desempenho',
      value: stats?.lowest_performer || '-',
      subtext: 'Precisa atenção',
      icon: AlertTriangle,
      color: 'text-red-600',
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
            <div className="text-2xl font-bold truncate">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const ProductivityStatsCards = memo(ProductivityStatsCardsComponent);
