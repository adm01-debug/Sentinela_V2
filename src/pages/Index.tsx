import { Users, Monitor, ShieldAlert, Activity } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { AlertItem } from '@/components/AlertItem';
import { EmployeeRow } from '@/components/EmployeeRow';
import { ActivityChart } from '@/components/ActivityChart';
import { SecurityMetrics } from '@/components/SecurityMetrics';
import { SimulateViolationButton } from '@/components/SimulateViolationButton';
import { employees, alerts, deviceStats } from '@/data/mockData';

const Index = () => {
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
          
          {/* Stats Grid */}
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
              value={deviceStats.alertsToday}
              icon={ShieldAlert}
              trend={{ value: 23, isPositive: false }}
              variant="danger"
            />
            <StatCard
              title="Bloqueios Hoje"
              value={deviceStats.blockedAttempts}
              icon={Activity}
              trend={{ value: 8, isPositive: false }}
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
            {/* Recent Alerts */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Alertas Recentes</h3>
                <button className="text-sm text-primary hover:underline">Ver todos</button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
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
