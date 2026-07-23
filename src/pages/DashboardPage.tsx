import { useState, useMemo, useEffect } from 'react';
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
import { PresentationMode } from '@/components/dashboard/PresentationMode';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { TopApplicationsCard } from '@/components/dashboard/TopApplicationsCard';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';

const DEPARTMENT_MAP: Record<string, string> = {
  engineering: 'Engenharia',
  marketing: 'Marketing',
  sales: 'Vendas',
  hr: 'RH',
};

export const DashboardPage = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [now, setNow] = useState(() => new Date());

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: realAlerts } = useRecentAlerts();
  const { data: realActivity } = useRecentActivity();
  const colors = useChartColors();
  const { t } = useTranslation();

  // Relógio ao vivo — atualiza a cada 30s para o indicador "Ao vivo"
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const departmentData = useMemo(() => {
    const base = [
      { name: 'Engenharia', value: 35, color: colors.primary },
      { name: 'Marketing', value: 22, color: colors.accent },
      { name: 'Vendas', value: 28, color: colors.success },
      { name: 'RH', value: 15, color: colors.info },
      { name: 'Financeiro', value: 18, color: colors.warning },
      { name: 'Suporte', value: 10, color: colors.destructive },
    ];
    if (departmentFilter === 'all') return base;
    const target = DEPARTMENT_MAP[departmentFilter];
    return target ? base.filter((d) => d.name === target) : base;
  }, [colors, departmentFilter]);

  // Períodos afetam labels de tendência exibidos nos cards
  const trendLabel = period === 'day' ? 'desde ontem' : period === 'month' ? 'este mês' : 'esta semana';

  const statsCards = useMemo(() => [
    { title: t('dashboard.totalEmployees'), value: stats?.totalEmployees ?? 128, icon: Users, iconColor: 'bg-primary/10 text-primary', trend: { value: 5.2, label: trendLabel }, accentColor: 'primary' as const },
    { title: t('dashboard.activeNow'), value: stats?.activeEmployees ?? 45, icon: Activity, iconColor: 'bg-success/10 text-success', trend: { value: 12, label: trendLabel }, accentColor: 'success' as const, pulse: true },
    { title: t('dashboard.productivity'), value: (stats?.averageProductivity ?? 87) + '%', icon: TrendingUp, iconColor: 'bg-warning/10 text-warning', trend: { value: 3.8, label: trendLabel }, accentColor: 'warning' as const },
    { title: t('dashboard.alerts'), value: stats?.alertsCount ?? 3, icon: AlertTriangle, iconColor: 'bg-destructive/10 text-destructive', trend: { value: -25, label: 'vs período anterior', isPositive: true }, accentColor: 'destructive' as const },
  ], [stats, t, trendLabel]);

  const alerts = useMemo(() => realAlerts && realAlerts.length > 0 ? realAlerts : fallbackAlerts, [realAlerts]);
  const activities = useMemo(() => realActivity && realActivity.length > 0 ? realActivity : fallbackActivities, [realActivity]);

  if (statsLoading) return <DashboardSkeleton />;

  const totalEmployees = stats?.totalEmployees ?? 128;
  const activeEmployees = stats?.activeEmployees ?? 45;
  const productivity = stats?.averageProductivity ?? 87;
  const alertsCount = stats?.alertsCount ?? 3;

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <OnboardingChecklist />
      
      
      <PageHeader
        title={t('dashboard.title')}
        description={`${t('dashboard.subtitle')} — ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        showBackButton={false}
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2" aria-live="polite">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span>Ao vivo · {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div role="tablist" aria-label="Período" className="flex gap-1 mr-2">
              {(['day', 'week', 'month'] as Period[]).map(p => (
                <Button
                  key={p}
                  role="tab"
                  aria-selected={period === p}
                  variant={period === p ? 'default' : 'outline'}
                  onClick={() => setPeriod(p)}
                  className="min-h-11 min-w-11 px-3"
                >
                  {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : 'Mês'}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="min-h-11 min-w-11"
              aria-label={departmentFilter !== 'all' ? 'Filtros (1 ativo)' : 'Filtros'}
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              Filtros
              {departmentFilter !== 'all' && <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 flex items-center justify-center">1</Badge>}
            </Button>
            <PresentationMode
              slides={[
                {
                  id: 'kpis',
                  title: 'Indicadores-chave',
                  content: (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {statsCards.map((card) => (
                        <StatCard key={card.accentColor} {...card} />
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'charts',
                  title: 'Tendências & Performance',
                  content: <DashboardChartsRow colors={colors} />,
                },
                {
                  id: 'ops',
                  title: 'Alertas, Atividade & Departamentos',
                  content: (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
                      <DashboardAlertsCard alerts={alerts} />
                      <DashboardActivityCard activities={activities} />
                      <DepartmentPieChart departmentData={departmentData} />
                    </div>
                  ),
                },
              ]}
            />
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
        {statsCards.map((card, i) => (
          <div key={card.accentColor} className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${i * 80}ms`, animationDuration: '400ms' }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <AIInsights
        totalEmployees={totalEmployees}
        activeEmployees={activeEmployees}
        productivity={productivity}
        alertsCount={alertsCount}
      />

      <DashboardChartsRow colors={colors} />

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        <DashboardAlertsCard alerts={alerts} />
        <DashboardActivityCard activities={activities} />
        <DepartmentPieChart departmentData={departmentData} />
        <TopApplicationsCard />
      </div>
    </div>
  );
};

export default DashboardPage;
