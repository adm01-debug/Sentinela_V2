import { Users, Monitor, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { AlertItem } from '@/components/AlertItem';
import { EmployeeRow } from '@/components/EmployeeRow';
import { ActivityChart } from '@/components/ActivityChart';
import { SecurityMetrics } from '@/components/SecurityMetrics';
import { SimulateViolationButton } from '@/components/SimulateViolationButton';
import { useSecurityViolations } from '@/hooks/useSecurityViolations';
import { useSecurityMetrics } from '@/hooks/useSecurityMetrics';
import { employees, deviceStats } from '@/data/mockData';

const Index = () => {
  const { violations, loading: violationsLoading } = useSecurityViolations();
  const { metrics, loading: metricsLoading } = useSecurityMetrics();

  const recentAlerts = violations.slice(0, 6).map(v => ({
    id: v.id,
    type: v.violation_type as any,
    severity: v.severity,
    employeeId: v.id,
    employeeName: v.employee_name,
    message: v.description || v.policy_name,
    timestamp: new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    device: v.device || 'Desconhecido'
  }));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="pl-64">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* Dev Tools */}
          <div className="flex justify-end">
            <SimulateViolationButton />
          </div>
          
          {/* Stats Grid - Real-time */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Colaboradores Online"
              value={`${deviceStats.online}/${deviceStats.totalDevices}`}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              variant="success"
            />
            <StatCard
              title="Dispositivos Monitorados"
              value={deviceStats.totalDevices}
              icon={Monitor}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Alertas Hoje"
              value={metricsLoading ? '...' : metrics.todayViolations}
              icon={ShieldAlert}
              trend={{ value: metrics.unreadViolations, isPositive: false }}
              variant="danger"
            />
            <StatCard
              title="Bloqueios Total"
              value={metricsLoading ? '...' : metrics.totalViolations}
              icon={Activity}
              trend={{ value: metrics.criticalViolations, isPositive: false }}
              variant="warning"
            />
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Chart */}
            <div className="lg:col-span-2">
              <ActivityChart />
            </div>
            
            {/* Security Metrics */}
            <div>
              <SecurityMetrics />
            </div>
          </div>

          {/* Alerts and Employees */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Alerts - Real-time */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Alertas Recentes</h3>
                  {metrics.unreadViolations > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                      {metrics.unreadViolations}
                    </span>
                  )}
                </div>
                <a href="/violations" className="text-sm text-primary hover:underline">Ver todos</a>
              </div>
              {violationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentAlerts.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {recentAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Nenhum alerta registrado
                </div>
              )}
            </div>

            {/* Active Employees */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Colaboradores Ativos</h3>
                <button className="text-sm text-primary hover:underline">Ver todos</button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {employees.filter(e => e.status !== 'offline').map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
