import { memo } from 'react';
import { Clock, Users, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleStats {
  totalSchedules: number;
  totalAssignments: number;
  pendingOvertimeRequests: number;
  recentBlocks: number;
}

interface ScheduleStatsCardsProps {
  stats: ScheduleStats;
  isLoading?: boolean;
}

function ScheduleStatsCardsComponent({ stats, isLoading }: ScheduleStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
      title: 'Horários Cadastrados',
      value: stats.totalSchedules,
      icon: Clock,
      description: 'Jornadas de trabalho'
    },
    {
      title: 'Atribuições Ativas',
      value: stats.totalAssignments,
      icon: Users,
      description: 'Funcionários com horário'
    },
    {
      title: 'Horas Extras Pendentes',
      value: stats.pendingOvertimeRequests,
      icon: AlertTriangle,
      description: 'Aguardando aprovação',
      highlight: stats.pendingOvertimeRequests > 0
    },
    {
      title: 'Bloqueios (24h)',
      value: stats.recentBlocks,
      icon: Lock,
      description: 'Acessos bloqueados'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={card.highlight ? 'border-warning' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.highlight ? 'text-warning' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.highlight ? 'text-warning' : ''}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const ScheduleStatsCards = memo(ScheduleStatsCardsComponent);
