// DashboardStats stub
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatsProps {
  stats?: { label: string; value: string | number }[];
}

export function DashboardStats({ stats = [] }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
        </Card>
      ))}
    </div>
  );
}
