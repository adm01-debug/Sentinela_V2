import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDevicesPage } from '@/hooks/useDevicesPage';
import { DeviceCard, DeviceStats } from '@/components/devices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RefreshCw, Search, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Erro ao carregar dispositivos</h3>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

const DevicesContent = React.memo(function DevicesContent() {
  const {
    devices,
    stats,
    filters,
    selectedDevice,
    isDetailsOpen,
    isLoading,
    isRefreshing,
    handleFilterChange,
    handleViewDetails,
    handleCloseDetails,
    handleDeactivate,
    handleReactivate,
    handleDelete,
    handleRefresh,
    isDeleting,
  } = useDevicesPage();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <DeviceStats {...stats} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar dispositivos..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
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

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onViewDetails={handleViewDetails}
              onDeactivate={handleDeactivate}
              onReactivate={handleReactivate}
            />
          ))}
        </div>
      )}

      {/* Device Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={handleCloseDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Dispositivo</DialogTitle>
            <DialogDescription>
              Informações completas do dispositivo
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedDevice.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="font-medium capitalize">{selectedDevice.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sistema</label>
                  <p className="font-medium">{selectedDevice.os}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP</label>
                  <p className="font-mono">{selectedDevice.ip_address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Versão do Agent</label>
                  <p className="font-mono">{selectedDevice.agent_version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={selectedDevice.is_active ? 'default' : 'secondary'}>
                    {selectedDevice.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedDevice.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
                
                {selectedDevice.is_active ? (
                  <Button
                    variant="outline"
                    onClick={() => handleDeactivate(selectedDevice.id)}
                  >
                    Desativar
                  </Button>
                ) : (
                  <Button onClick={() => handleReactivate(selectedDevice.id)}>
                    Reativar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default function Devices() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispositivos</h1>
          <p className="text-muted-foreground">
            Gerencie os dispositivos monitorados
          </p>
        </div>
      </div>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSkeleton />}>
          <DevicesContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
