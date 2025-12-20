import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { employees, alerts } from '@/data/mockData';
import { ApplicationCard } from '@/components/ApplicationCard';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { EmployeeAlertItem } from '@/components/EmployeeAlertItem';
import { EmployeeDetailSkeleton } from '@/components/PageSkeletons';

import { 
import { useEmployeeDetailPage } from '@/hooks/useEmployeeDetailPage';

  employeeApplications, 
  employeeActivities, 
  defaultApplications, 
  defaultActivities 
} from '@/data/employeeDetailData';

const statusStyles = {
  online: 'bg-success',
  offline: 'bg-muted-foreground',
  idle: 'bg-warning',
};

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  idle: 'Ausente',
};

const EmployeeDetailContent = memo(function EmployeeDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const employee = employees.find(e => e.id === id);
  
  if (!employee) {
  if (isLoading) {
    return <EmployeeDetailSkeleton />;
  }


    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Colaborador não encontrado</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const applications = employeeApplications[id!] || defaultApplications;
  const activities = employeeActivities[id!] || defaultActivities;
  const employeeAlerts = alerts.filter(a => a.employeeId === id);

  const totalProductiveTime = applications
    .filter(a => a.category === 'productive')
    .reduce((acc, a) => acc + a.duration, 0);

  const totalTime = applications.reduce((acc, a) => acc + a.duration, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Detalhes do Colaborador</h1>
            <p className="text-sm text-muted-foreground">Monitoramento em tempo real</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Employee Info Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                {employee.avatar}
              </div>
              <div className={cn(
                'absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-card',
                statusStyles[employee.status]
              )} />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{employee.name}</h2>
                  <span className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    employee.status === 'online' ? 'bg-success/20 text-success' :
                    employee.status === 'idle' ? 'bg-warning/20 text-warning' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {statusLabels[employee.status]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {employee.device === 'desktop' ? (
                    <Monitor className="h-4 w-4" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                  <span>{employee.device === 'desktop' ? 'Desktop' : 'Mobile'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Última atividade: {employee.lastActivity}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-accent/50 p-4">
              <span className="text-sm text-muted-foreground">Produtividade</span>
              <span className={cn(
                'text-3xl font-bold',
                employee.productivityScore >= 85 ? 'text-success' :
                employee.productivityScore >= 70 ? 'text-warning' :
                'text-destructive'
              )}>
                {employee.productivityScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Total</p>
                <p className="text-xl font-bold">{Math.floor(totalTime / 60)}h {totalTime % 60}m</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Produtivo</p>
                <p className="text-xl font-bold">{Math.floor(totalProductiveTime / 60)}h {totalProductiveTime % 60}m</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
                <Monitor className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Apps Usados</p>
                <p className="text-xl font-bold">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Hoje</p>
                <p className="text-xl font-bold">{employeeAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Aplicativos Utilizados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {applications.map(app => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Atividades</h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>

        {/* Alerts Section */}
        {employeeAlerts.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Alertas de Segurança</h3>
            <div className="space-y-3">
              {employeeAlerts.map(alert => (
                <EmployeeAlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function EmployeeDetail() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <EmployeeDetailContent />
      </Suspense>
    </ErrorBoundary>
  );
}
