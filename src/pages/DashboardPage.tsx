import { useState } from 'react';
import { Users, Activity, TrendingUp, AlertTriangle, Filter, X } from 'lucide-react';
import { useDashboardStats, useActivityChart, useTopEmployees } from '@/hooks/useDashboard';
import { StatCard } from '@/components/StatCard';
import { ActivityChart } from '@/components/ActivityChart';
import { TopEmployeesList } from '@/components/TopEmployeesList';
import { RecentAlerts } from '@/components/RecentAlerts';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Period = 'day' | 'week' | 'month';

export const DashboardPage = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activityData } = useActivityChart(period);
  const { data: topEmployees } = useTopEmployees(5);

  if (statsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* Period Filter */}
          <div className="flex gap-1">
            {(['day', 'week', 'month'] as Period[]).map(p => (
              <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
                {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
          {/* Filters Toggle */}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-1" />
            Filtros
            {departmentFilter !== 'all' && <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">1</Badge>}
          </Button>
          {/* Dashboard Customizer */}
          <DashboardCustomizer />
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Departamento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os departamentos</SelectItem>
              <SelectItem value="engineering">Engenharia</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Vendas</SelectItem>
              <SelectItem value="hr">RH</SelectItem>
            </SelectContent>
          </Select>
          {departmentFilter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setDepartmentFilter('all')}>
              <X className="h-4 w-4 mr-1" />Limpar
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats?.totalEmployees || 0} icon={Users} />
        <StatCard title="Active Now" value={stats?.activeEmployees || 0} icon={Activity} trend={{ value: 5 }} />
        <StatCard title="Productivity" value={(stats?.averageProductivity || 0) + '%'} icon={TrendingUp} trend={{ value: stats?.productivityTrend || 0 }} />
        <StatCard title="Open Alerts" value={stats?.alertsCount || 0} icon={AlertTriangle} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart data={activityData || []} /></div>
        <div><TopEmployeesList employees={topEmployees || []} /></div>
      </div>
      <RecentAlerts />
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton width={200} height={32} />
    <div className="grid grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} height={100} />)}</div>
  </div>
);

export default DashboardPage;
