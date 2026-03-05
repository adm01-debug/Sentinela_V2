import { memo } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateStatsCardsProps {
  total?: number;
  active?: number;
  pending?: number;
  inactive?: number;
}

export const TemplateStatsCards = memo(function TemplateStatsCards({
  total = 0,
  active = 0,
  pending = 0,
  inactive = 0,
}: TemplateStatsCardsProps) {
  const stats = [
    { title: 'Total', value: total, icon: FileText },
    { title: 'Ativos', value: active, icon: CheckCircle },
    { title: 'Pendentes', value: pending, icon: Clock },
    { title: 'Inativos', value: inactive, icon: AlertTriangle },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
