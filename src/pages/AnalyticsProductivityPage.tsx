import { Card, CardHeader, CardTitle, CardContent  } from '@/components/ui/card';
import { Progress  } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback  } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useProductivityAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsProductivityPage() {
  const { data } = useProductivityAnalytics();

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Análise de Produtividade</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Top Produtivos</CardTitle></CardHeader><CardContent className="space-y-4">{data?.topPerformers?.map((user, i) => <div key={i} className="flex items-center gap-4"><span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span><Avatar><AvatarImage src={user.avatar} /><AvatarFallback>{user.name?.charAt(0)}</AvatarFallback></Avatar><div className="flex-1"><p className="font-medium">{user.name}</p><Progress value={user.productivity} className="h-2 mt-1" /></div><span className="font-bold">{user.productivity}%</span></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Por Departamento</CardTitle></CardHeader><CardContent className="space-y-4">{data?.byDepartment?.map((dept, i) => <div key={i} className="flex items-center justify-between p-4 border rounded-lg"><div><p className="font-medium">{dept.name}</p><p className="text-sm text-muted-foreground">{dept.employeeCount} funcionários</p></div><div className="flex items-center gap-2">{getTrendIcon(dept.trend)}<span className="text-xl font-bold">{dept.productivity}%</span></div></div>)}</CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Métricas de Produtividade</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3">{data?.metrics?.map((m, i) => <div key={i} className="p-4 border rounded-lg text-center"><p className="text-3xl font-bold">{m.value}</p><p className="text-muted-foreground">{m.label}</p></div>)}</CardContent></Card>
    </div>
  );
}