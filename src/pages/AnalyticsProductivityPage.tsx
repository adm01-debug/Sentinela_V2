import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Loader2, X } from 'lucide-react';
import { useProductivityAnalytics } from '@/hooks/useAnalytics';
import { useCompanyAppUsage } from '@/hooks/useCompanyAppUsage';
import { useEmployees, type EmployeeWithDetails } from '@/hooks/useEmployees';
import { AppCategoryManager } from '@/components/productivity/AppCategoryManager';
import { ProductivityCategoryDonut } from '@/components/productivity/ProductivityCategoryDonut';
import { ProductivityScoreCard } from '@/components/productivity/ProductivityScoreCard';
import { WeeklyRankingCard } from '@/components/productivity/WeeklyRankingCard';


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

const RANGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '1', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
];

export default function AnalyticsProductivityPage() {
  const { data } = useProductivityAnalytics();
  const [days, setDays] = useState<string>('7');
  const [employeeName, setEmployeeName] = useState<string>('all');
  const [device, setDevice] = useState<string>('');

  const { data: employeesData } = useEmployees();
  const employees = (employeesData ?? []) as EmployeeWithDetails[];
  const employeeOptions = useMemo(
    () =>
      employees
        .map((e) => e.full_name ?? e.name)
        .filter((n): n is string => !!n)
        .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [employees],
  );

  const { data: appUsage, isLoading: isLoadingUsage } = useCompanyAppUsage(Number(days), {
    employeeName: employeeName === 'all' ? undefined : employeeName,
    device: device.trim() || undefined,
  });

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const topPerformers = (data?.topPerformers || []) as PerformerItem[];
  const byDepartment = (data?.byDepartment || []) as DepartmentItem[];
  const metrics = (data?.metrics || []) as MetricItem[];

  const usage = appUsage?.usage ?? [];
  const idleSeconds = appUsage?.idleSeconds ?? 0;

  const hasFilters = employeeName !== 'all' || device.trim() !== '' || days !== '7';
  const clearFilters = () => {
    setEmployeeName('all');
    setDevice('');
    setDays('7');
  };


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Análise de Produtividade</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="categories">Categorização</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            <div className="grid gap-1">
              <Label htmlFor="prod-range" className="text-xs text-muted-foreground">Período</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger id="prod-range" className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANGE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="prod-employee" className="text-xs text-muted-foreground">Colaborador</Label>
              <Select value={employeeName} onValueChange={setEmployeeName}>
                <SelectTrigger id="prod-employee" className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {employeeOptions.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="prod-device" className="text-xs text-muted-foreground">Dispositivo</Label>
              <Input
                id="prod-device"
                placeholder="Ex.: NOTE-042"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-44"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                <X className="mr-1 h-3.5 w-3.5" /> Limpar
              </Button>
            )}
          </div>


          {isLoadingUsage ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <ProductivityScoreCard usage={usage} idleSeconds={idleSeconds} />
              <div className="md:col-span-2">
                <ProductivityCategoryDonut usage={usage} />
              </div>
            </div>
          )}

          <WeeklyRankingCard days={Math.max(1, Number(days) || 7)} />

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
        </TabsContent>

        <TabsContent value="categories">
          <AppCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
