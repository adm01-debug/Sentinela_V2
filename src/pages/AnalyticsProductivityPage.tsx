import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useProductivityAnalytics } from '@/hooks/useAnalytics';
import { AppCategoryManager } from '@/components/productivity/AppCategoryManager';
import { ProductivityCategoryDonut } from '@/components/productivity/ProductivityCategoryDonut';
import { ProductivityScoreCard } from '@/components/productivity/ProductivityScoreCard';

interface PerformerItem {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  productivity?: number;
}

interface DepartmentItem {
  label: string;
  value: number;
  name?: string;
  employeeCount?: number;
  trend?: number;
  productivity?: number;
}

interface MetricItem {
  label: string;
  value: number | string;
}

export default function AnalyticsProductivityPage() {
  const { data } = useProductivityAnalytics();

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const topPerformers = (data?.topPerformers || []) as PerformerItem[];
  const byDepartment = (data?.byDepartment || []) as DepartmentItem[];
  const metrics = (data?.metrics || []) as MetricItem[];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Análise de Produtividade</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Produtivos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((user, i) => (
              <div key={user.id || i} className="flex items-center gap-4">
                <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                <Avatar><AvatarImage src={user.avatar} /><AvatarFallback>{user.name?.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <Progress value={user.productivity || user.score} className="h-2 mt-1" />
                </div>
                <span className="font-bold">{user.productivity || user.score}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Por Departamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {byDepartment.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{dept.name || dept.label}</p>
                  <p className="text-sm text-muted-foreground">{dept.employeeCount || 0} funcionários</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(dept.trend || 0)}
                  <span className="text-xl font-bold">{dept.productivity || dept.value}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Métricas de Produtividade</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {metrics.map((m, i) => (
            <div key={i} className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">{m.value}</p>
              <p className="text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
