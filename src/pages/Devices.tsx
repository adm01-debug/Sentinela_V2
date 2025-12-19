import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Smartphone, 
  Laptop, 
  Search, 
  Loader2,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Device {
  id: string;
  device_name: string;
  device_type: string;
  is_active: boolean;
  is_primary: boolean;
  last_activity_at: string | null;
  employee_name?: string;
  employee_id?: string;
}

interface MobileDevice {
  id: string;
  device_name: string;
  device_model: string | null;
  os_version: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  last_latitude: number | null;
  last_longitude: number | null;
  employee_name?: string;
}

async function fetchDevices() {
  const { data: desktopDevices, error: desktopError } = await supabase
    .from('employee_devices')
    .select(`
      id,
      device_name,
      device_type,
      is_active,
      is_primary,
      last_activity_at,
      employees (id, name)
    `)
    .order('last_activity_at', { ascending: false, nullsFirst: false });

  const { data: mobileDevices, error: mobileError } = await supabase
    .from('mobile_devices')
    .select(`
      id,
      device_name,
      device_model,
      os_version,
      is_active,
      last_seen_at,
      last_latitude,
      last_longitude,
      employees (id, name)
    `)
    .order('last_seen_at', { ascending: false, nullsFirst: false });

  if (desktopError) throw desktopError;
  if (mobileError) throw mobileError;

  return {
    desktop: (desktopDevices || []).map(d => ({
      ...d,
      employee_name: d.employees?.name,
      employee_id: d.employees?.id
    })),
    mobile: (mobileDevices || []).map(d => ({
      ...d,
      employee_name: d.employees?.name
    }))
  };
}

export default function Devices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['all-devices'],
    queryFn: fetchDevices,
    refetchInterval: 30000
  });

  const filteredDesktop = useMemo(() => {
    if (!data?.desktop) return [];
    return data.desktop.filter(device => {
      const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'online' && device.is_active) ||
                           (statusFilter === 'offline' && !device.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [data?.desktop, searchTerm, statusFilter]);

  const filteredMobile = useMemo(() => {
    if (!data?.mobile) return [];
    return data.mobile.filter(device => {
      const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'online' && device.is_active) ||
                           (statusFilter === 'offline' && !device.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [data?.mobile, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    totalDesktop: data?.desktop?.length || 0,
    totalMobile: data?.mobile?.length || 0,
    onlineDesktop: data?.desktop?.filter(d => d.is_active).length || 0,
    onlineMobile: data?.mobile?.filter(d => d.is_active).length || 0
  }), [data]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'laptop': return Laptop;
      default: return Monitor;
    }
  };

  const formatLastSeen = (date: string | null) => {
    if (!date) return 'Nunca';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins} min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Dispositivos</h1>
            <p className="text-muted-foreground">Gerencie todos os dispositivos monitorados</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desktop/Laptop</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDesktop}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.onlineDesktop} online
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mobile</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMobile}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.onlineMobile} online
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Online</CardTitle>
                <Wifi className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {stats.onlineDesktop + stats.onlineMobile}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {stats.totalDesktop + stats.totalMobile} dispositivos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline</CardTitle>
                <WifiOff className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {(stats.totalDesktop - stats.onlineDesktop) + (stats.totalMobile - stats.onlineMobile)}
                </div>
                <p className="text-xs text-muted-foreground">
                  dispositivos inativos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'online' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('online')}
              >
                Online
              </Button>
              <Button
                variant={statusFilter === 'offline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('offline')}
              >
                Offline
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="desktop" className="space-y-4">
            <TabsList>
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="h-4 w-4" />
                Desktop ({filteredDesktop.length})
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile ({filteredMobile.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="desktop" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDesktop.map(device => {
                  const Icon = getDeviceIcon(device.device_type);
                  return (
                    <Card key={device.id} className={device.is_active ? 'border-success/50' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-base">{device.device_name}</CardTitle>
                          </div>
                          <Badge variant={device.is_active ? 'default' : 'secondary'}>
                            {device.is_active ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        <CardDescription>{device.employee_name || 'Sem funcionário'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLastSeen(device.last_activity_at)}
                          </div>
                          {device.is_primary && (
                            <Badge variant="outline" className="text-xs">Principal</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredDesktop.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhum dispositivo encontrado
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMobile.map(device => (
                  <Card key={device.id} className={device.is_active ? 'border-success/50' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-base">{device.device_name}</CardTitle>
                        </div>
                        <Badge variant={device.is_active ? 'default' : 'secondary'}>
                          {device.is_active ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      <CardDescription>{device.employee_name || 'Sem funcionário'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastSeen(device.last_seen_at)}
                        </div>
                        {device.device_model && (
                          <div>{device.device_model} - {device.os_version}</div>
                        )}
                        {device.last_latitude && device.last_longitude && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Localização disponível
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredMobile.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhum dispositivo móvel encontrado
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
