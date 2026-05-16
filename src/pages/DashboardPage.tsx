import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Activity, TrendingUp, AlertTriangle, Filter, X } from 'lucide-react';
import { useDashboardStats, useRecentAlerts, useRecentActivity } from '@/hooks/useDashboard';
import { useChartColors } from '@/hooks/useChartColors';
import { StatCard } from '@/components/StatCard';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { PageHeader } from '@/components/layout/PageHeader';

import { type Period, fallbackAlerts, fallbackActivities } from './dashboard/dashboardData';
import { DashboardChartsRow, DepartmentPieChart } from './dashboard/DashboardCharts';
import { DashboardAlertsCard, DashboardActivityCard } from './dashboard/DashboardCards';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';

export const DashboardPage = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: realAlerts } = useRecentAlerts();
  const { data: realActivity } = useRecentActivity();
  const colors = useChartColors();
  const { t } = useTranslation();

  const departmentData = [
    { name: 'Engenharia', value: 35, color: colors.primary },
    { name: 'Marketing', value: 22, color: colors.accent },
    { name: 'Vendas', value: 28, color: colors.success },
    { name: 'RH', value: 15, color: colors.info },
    { name: 'Financeiro', value: 18, color: colors.warning },
    { name: 'Suporte', value: 10, color: colors.destructive },
  ];

  const alerts = realAlerts && realAlerts.length > 0 ? realAlerts : fallbackAlerts;
  const activities = realActivity && realActivity.length > 0 ? realActivity : fallbackActivities;

  if (statsLoading) return <DashboardSkeleton />;

  const totalEmployees = stats?.totalEmployees || 128;
  const activeEmployees = stats?.activeEmployees || 45;
  const productivity = stats?.averageProductivity || 87;
  const alertsCount = stats?.alertsCount || 3;

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      
      <PageHeader
        title={t('dashboard.title')}
        description={`${t('dashboard.subtitle')} — ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        showBackButton={false}
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-1 mr-2">
              {(['day', 'week', 'month'] as Period[]).map(p => (
                <Button 
                  key={p} 
                  variant={period === p ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setPeriod(p)}
                  className="h-8"
                >
                  {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : 'Mês'}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8">
              <Filter className="h-4 w-4 mr-1.5" />
              Filtros
              {departmentFilter !== 'all' && <Badge variant="secondary" className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center">1</Badge>}
            </Button>
            <DashboardCustomizer />
          </div>
        }
      />

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t('dashboard.totalEmployees'), value: totalEmployees, icon: Users, iconColor: 'bg-primary/10 text-primary', trend: { value: 5.2, label: 'desde o mês passado' }, accentColor: 'primary' as const },
          { title: t('dashboard.activeNow'), value: activeEmployees, icon: Activity, iconColor: 'bg-success/10 text-success', trend: { value: 12, label: 'desde ontem' }, accentColor: 'success' as const, pulse: true },
          { title: t('dashboard.productivity'), value: productivity + '%', icon: TrendingUp, iconColor: 'bg-warning/10 text-warning', trend: { value: 3.8, label: 'esta semana' }, accentColor: 'warning' as const },
          { title: t('dashboard.alerts'), value: alertsCount, icon: AlertTriangle, iconColor: 'bg-destructive/10 text-destructive', trend: { value: -25, label: 'vs semana passada', isPositive: true }, accentColor: 'destructive' as const },
        ].map((card, i) => (
          <div key={card.accentColor} className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${i * 80}ms`, animationDuration: '400ms' }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <DashboardChartsRow colors={colors} />

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        <DashboardAlertsCard alerts={alerts} />
        <DashboardActivityCard activities={activities} />
        <DepartmentPieChart departmentData={departmentData} />
      </div>
    </div>
  );
};

export default DashboardPage;
