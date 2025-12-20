import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRateLimitDashboardPage } from '@/hooks/useRateLimitDashboardPage';
import { RateLimitStats, RateLimitLogsTable, BlockedIPsList } from '@/components/rate-limit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Erro ao carregar dashboard</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button onClick={resetErrorBoundary} className="mt-4">Tentar novamente</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

const RateLimitDashboardContent = React.memo(function RateLimitDashboardContent() {
  const {
    logs,
    blockedIPs,
    stats,
    filters,
    isLoading,
    isRefreshing,
    handleFilterChange,
    handleUnblockIP,
    handleRefresh,
    isUnblocking,
  } = useRateLimitDashboardPage();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <RateLimitStats
        totalRequests={stats.totalRequests}
        blockedRequests={stats.blockedRequests}
        blockedPercentage={stats.blockedPercentage}
        uniqueIPs={stats.uniqueIPs}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por IP..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.endpoint}
              onValueChange={(value) => handleFilterChange('endpoint', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos endpoints</SelectItem>
                <SelectItem value="/api/auth">Auth</SelectItem>
                <SelectItem value="/api/users">Users</SelectItem>
                <SelectItem value="/api/violations">Violations</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.blocked}
              onValueChange={(value) => handleFilterChange('blocked', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Bloqueados</SelectItem>
                <SelectItem value="false">Permitidos</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Logs Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Rate Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <RateLimitLogsTable logs={logs} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Blocked IPs */}
        <div>
          <BlockedIPsList
            blockedIPs={blockedIPs}
            onUnblock={handleUnblockIP}
            isUnblocking={isUnblocking}
          />
        </div>
      </div>
    </div>
  );
});

export default function RateLimitDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Limit Dashboard</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie limites de requisições
          </p>
        </div>
      </div>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSkeleton />}>
          <RateLimitDashboardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
