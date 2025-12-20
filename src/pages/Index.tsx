import { memo, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SkipLink } from '@/components/a11y/SkipLink';
import { StatCard } from '@/components/StatCard';
import { SecurityMetrics } from '@/components/SecurityMetrics';
import { ActivityChart } from '@/components/ActivityChart';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { 
  Users, 
  Monitor, 
  AlertTriangle, 
  ShieldAlert,
  TrendingUp,
  Clock,
  Activity,
} from 'lucide-react';
import { useDeviceStats } from '@/hooks/useDeviceStats';
import { useSecurityViolations, useViolationStats } from '@/hooks/useSecurityViolations';
import { useEmployees } from '@/hooks/useEmployees';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { cn } from '@/lib/utils';

// ============================================================
// MEMOIZED STAT CARDS
// ============================================================

interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: number;
  color?: string;
}

const MemoizedStatCard = memo(function MemoizedStatCard({ 
  data 
}: { 
  data: StatCardData 
}) {
  return (
    <StatCard
      title={data.title}
      value={String(data.value)}
      icon={data.icon}
      description={data.description}
      trend={data.trend}
    />
  );
});

MemoizedStatCard.displayName = 'MemoizedStatCard';

// ============================================================
// MEMOIZED SECTIONS
// ============================================================

const MemoizedSecurityMetrics = memo(SecurityMetrics);
MemoizedSecurityMetrics.displayName = 'MemoizedSecurityMetrics';

const MemoizedActivityChart = memo(ActivityChart);
MemoizedActivityChart.displayName = 'MemoizedActivityChart';

// ============================================================
// STATS SECTION COMPONENT
// ============================================================

interface StatsSectionProps {
  employeesOnline: number;
  totalEmployees: number;
  devicesOnline: number;
  totalDevices: number;
  alertsToday: number;
  criticalAlerts: number;
}

const StatsSection = memo(function StatsSection({
  employeesOnline,
  totalEmployees,
  devicesOnline,
  totalDevices,
  alertsToday,
  criticalAlerts,
}: StatsSectionProps) {
  const stats = useMemo<StatCardData[]>(() => [
    {
      title: 'Colaboradores Online',
      value: `${employeesOnline}/${totalEmployees}`,
      icon: Users,
      description: 'Ativos agora',
      trend: totalEmployees > 0 ? Math.round((employeesOnline / totalEmployees) * 100) : 0,
    },
    {
      title: 'Dispositivos',
      value: `${devicesOnline}/${totalDevices}`,
      icon: Monitor,
      description: 'Conectados',
      trend: totalDevices > 0 ? Math.round((devicesOnline / totalDevices) * 100) : 0,
    },
    {
      title: 'Alertas Hoje',
      value: alertsToday,
      icon: AlertTriangle,
      description: 'Violações detectadas',
      color: alertsToday > 10 ? 'destructive' : undefined,
    },
    {
      title: 'Alertas Críticos',
      value: criticalAlerts,
      icon: ShieldAlert,
      description: 'Requerem atenção',
      color: criticalAlerts > 0 ? 'destructive' : undefined,
    },
  ], [employeesOnline, totalEmployees, devicesOnline, totalDevices, alertsToday, criticalAlerts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <MemoizedStatCard key={index} data={stat} />
      ))}
    </div>
  );
});

StatsSection.displayName = 'StatsSection';

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================

export default function Index() {
  // Hooks com dados
  const { data: deviceStats, isLoading: loadingDevices } = useDeviceStats();
  const { data: employees, isLoading: loadingEmployees } = useEmployees({ status: 'active' });
  const { data: violationStats, isLoading: loadingViolations } = useViolationStats();
  const { visibleWidgets } = useDashboardLayout();

  // Memoizar cálculos derivados
  const dashboardData = useMemo(() => {
    const activeEmployees = employees?.filter(e => e.status === 'active') || [];
    
    return {
      employeesOnline: deviceStats?.online || 0,
      totalEmployees: activeEmployees.length,
      devicesOnline: deviceStats?.online || 0,
      totalDevices: deviceStats?.total || 0,
      alertsToday: violationStats?.total || 0,
      criticalAlerts: violationStats?.critical || 0,
      unreadAlerts: violationStats?.unread || 0,
    };
  }, [employees, deviceStats, violationStats]);

  // Callback memoizado para refresh
  const handleRefresh = useCallback(() => {
    // Refetch pode ser adicionado aqui se necessário
    console.log('Dashboard refresh requested');
  }, []);

  // Loading state
  const isLoading = loadingDevices || loadingEmployees || loadingViolations;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main id="main-content" className="p-4 lg:p-6 space-y-6">
          {/* Header com título e ações */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral do monitoramento
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette />
              <DashboardCustomizer />
            </div>
          </div>

          {/* Stats Cards */}
          <StatsSection {...dashboardData} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart - 2 columns */}
            <div className="lg:col-span-2">
              <MemoizedActivityChart />
            </div>

            {/* Security Metrics - 1 column */}
            <div>
              <MemoizedSecurityMetrics />
            </div>
          </div>

          {/* Additional Widgets based on user preferences */}
          {visibleWidgets.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleWidgets.slice(4).map((widget) => (
                <div 
                  key={widget.id}
                  className={cn(
                    'rounded-lg border bg-card p-4',
                    widget.size === 'large' && 'lg:col-span-2',
                    widget.size === 'full' && 'lg:col-span-3'
                  )}
                >
                  <h3 className="font-semibold mb-2">{widget.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Widget: {widget.type}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
