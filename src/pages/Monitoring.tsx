import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useMonitoringPage } from '@/hooks/useMonitoringPage';
import { MonitoringStatsCards, MonitoringFilters, EmployeeMonitoringCard } from '@/components/monitoring';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';


const MonitoringContent = memo(function MonitoringContent() {
  const {
    selectedEmployee,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    employees,
    departments,
    activitySummary,
    stats,
    isLoadingEmployees,
    isLoadingSummary,
    handleSelectEmployee,
  } = useMonitoringPage();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Monitoramento em Tempo Real"
        description="Acompanhe a atividade dos funcionários"
      />

      <MonitoringStatsCards stats={stats} />

      <MonitoringFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        departments={departments}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoadingEmployees ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-2'}>
              {employees.map((employee) => (
                <EmployeeMonitoringCard
                  key={employee.id}
                  employee={employee}
                  isSelected={selectedEmployee?.id === employee.id}
                  onClick={() => handleSelectEmployee(employee)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {selectedEmployee ? selectedEmployee.name : 'Detalhes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <p className="text-muted-foreground text-center py-8">
                  Selecione um funcionário para ver os detalhes
                </p>
              ) : isLoadingSummary ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : activitySummary ? (
                <Tabs defaultValue="activity">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activity">Atividade</TabsTrigger>
                    <TabsTrigger value="apps">Apps & Sites</TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{activitySummary.total_keystrokes}</p>
                        <p className="text-xs text-muted-foreground">Teclas</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{activitySummary.total_clicks}</p>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tempo Ativo</span>
                        <span className="font-medium">{formatDuration(activitySummary.total_active_time)}</span>
                      </div>
                      <Progress 
                        value={(activitySummary.total_active_time / (activitySummary.total_active_time + activitySummary.total_idle_time)) * 100} 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tempo Ocioso</span>
                        <span className="font-medium">{formatDuration(activitySummary.total_idle_time)}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="apps" className="mt-4">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AppWindow className="h-4 w-4" />
                            Top Aplicativos
                          </h4>
                          <div className="space-y-2">
                            {activitySummary.top_apps.map((app, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="truncate">{app.name}</span>
                                <Badge variant="outline">{formatDuration(app.duration)}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Top Sites
                          </h4>
                          <div className="space-y-2">
                            {activitySummary.top_urls.map((url, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="truncate">{url.domain}</span>
                                <Badge variant="outline">{url.visits} visitas</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
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

export default function Monitoring() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <MonitoringContent />
      </Suspense>
    </ErrorBoundary>
  );
}
