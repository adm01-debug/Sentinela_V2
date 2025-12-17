import { Keyboard, MousePointer2, Users, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ActivityStatsCardsProps {
  totalKeystrokes: number;
  totalClicks: number;
  activeEmployeesCount: number;
  keystrokesPerMinute: number;
  clicksPerMinute: number;
}

export const ActivityStatsCards = ({
  totalKeystrokes,
  totalClicks,
  activeEmployeesCount,
  keystrokesPerMinute,
  clicksPerMinute,
}: ActivityStatsCardsProps) => {
  const stats = [
    {
      title: 'Teclas (última hora)',
      value: totalKeystrokes.toLocaleString('pt-BR'),
      icon: Keyboard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Cliques (última hora)',
      value: totalClicks.toLocaleString('pt-BR'),
      icon: MousePointer2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Funcionários Ativos',
      value: activeEmployeesCount.toString(),
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Atividade/min',
      value: `${keystrokesPerMinute + clicksPerMinute}`,
      subtitle: `${keystrokesPerMinute} teclas • ${clicksPerMinute} cliques`,
      icon: Activity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
