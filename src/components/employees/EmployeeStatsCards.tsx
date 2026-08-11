import { memo } from 'react';
import { Users, UserCheck, Building2, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmployeeStats } from '@/hooks/useEmployeesPage';

interface EmployeeStatsCardsProps {
  stats: EmployeeStats;
  isLoading?: boolean;
}

function EmployeeStatsCardsComponent({ stats, isLoading }: EmployeeStatsCardsProps) {
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
      title: 'Total de Funcionários',
      value: stats.total,
      icon: Users,
      description: 'Cadastrados no sistema'
    },
    {
      title: 'Funcionários Ativos',
      value: stats.active,
      icon: UserCheck,
      description: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`
    },
    {
      title: 'Com Equipe',
      value: stats.withTeam,
      icon: Building2,
      description: 'Associados a equipes'
    },
    {
      title: 'Com Dispositivos',
      value: stats.withDevices,
      icon: Monitor,
      description: 'Dispositivos vinculados'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const EmployeeStatsCards = memo(EmployeeStatsCardsComponent);
