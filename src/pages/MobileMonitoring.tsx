import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useMobileMonitoringPage } from '@/hooks/useMobileMonitoringPage';
import { MobileDeviceCard } from '@/components/mobile';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MobileDevicesMap } from '@/components/MobileDevicesMap';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MobileMonitoringContent = memo(function MobileMonitoringContent() {
  const {
    selectedDevice,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    devices,
    allDevices,
    locationHistory,
    stats,
    isLoadingDevices,
    handleSelectDevice,
  } = useMobileMonitoringPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Monitoramento Mobile"
        description="Acompanhe dispositivos moveis em tempo real"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bateria Baixa</CardTitle>
            <BatteryLow className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowBattery}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar dispositivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <Label htmlFor="auto">Auto</Label>
            <Switch id="auto" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoadingDevices ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : viewMode === 'map' ? (
        <Card>
          <CardContent className="p-0">
            <div className="h-[600px]">
              <MobileDevicesMap
                devices={allDevices.filter(d => d.last_location)}
                selectedDeviceId={selectedDevice?.device_id}
                onDeviceClick={(device) => handleSelectDevice(device as any)}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum dispositivo encontrado</p>
              </CardContent>
            </Card>
          ) : (
            devices.map((device) => (
              <MobileDeviceCard
                key={device.id}
                device={device}
                isSelected={selectedDevice?.id === device.id}
                onClick={() => handleSelectDevice(device)}
              />
            ))
          )}
        </div>
      )}
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

export default function MobileMonitoring() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <MobileMonitoringContent />
      </Suspense>
    </ErrorBoundary>
  );
}
