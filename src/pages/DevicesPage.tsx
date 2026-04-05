import { useMemo } from 'react';
import { Search, Monitor, Smartphone, Tablet, RefreshCw, MoreVertical, Trash2, Power, PowerOff, Eye, HardDrive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useDevicesPage } from '@/hooks/useDevicesPage';
import { useChartColors } from '@/hooks/useChartColors';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const typeIcons: Record<string, React.ReactNode> = {
  desktop: <Monitor className="h-5 w-5" />,
  mobile: <Smartphone className="h-5 w-5" />,
  tablet: <Tablet className="h-5 w-5" />,
};

export default function DevicesPage() {
  const {
    devices, stats, filters, selectedDevice, isDetailsOpen,
    isLoading, isRefreshing,
    handleFilterChange, handleViewDetails, handleCloseDetails,
    handleDeactivate, handleReactivate, handleDelete, handleRefresh,
    isDeactivating, isDeleting,
  } = useDevicesPage();
  const colors = useChartColors();

  const typeData = useMemo(() => [
    { name: 'Desktop', value: stats.desktop, color: colors.primary },
    { name: 'Mobile', value: stats.mobile, color: colors.accent },
    { name: 'Tablet', value: Math.max(0, stats.total - stats.desktop - stats.mobile), color: colors.warning },
  ].filter(d => d.value > 0), [stats, colors]);

  const statusData = useMemo(() => [
    { name: 'Ativos', value: stats.active, color: colors.success },
    { name: 'Inativos', value: stats.total - stats.active, color: colors.muted },
  ].filter(d => d.value > 0), [stats, colors]);

  // OS distribution
  const osData = useMemo(() => {
    const osMap: Record<string, number> = {};
    devices.forEach(d => {
      const os = d.os_name || 'Desconhecido';
      osMap[os] = (osMap[os] || 0) + 1;
    });
    return Object.entries(osMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [devices]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dispositivos</h1>
          <p className="text-muted-foreground mt-1">Gerencie dispositivos monitorados</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><HardDrive className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-2xl font-bold mt-1">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Power className="h-5 w-5 mx-auto text-success" /><p className="text-2xl font-bold mt-1">{stats.active}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Monitor className="h-5 w-5 mx-auto text-primary" /><p className="text-2xl font-bold mt-1">{stats.desktop}</p><p className="text-xs text-muted-foreground">Desktop</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Smartphone className="h-5 w-5 mx-auto text-accent-foreground" /><p className="text-2xl font-bold mt-1">{stats.mobile}</p><p className="text-xs text-muted-foreground">Mobile</p></CardContent></Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Por Tipo</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {typeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {typeData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Por Sistema Operacional</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={osData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis type="number" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" name="Dispositivos" fill={colors.info} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou IP..." className="pl-9" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
        </div>
        <Select value={filters.type} onValueChange={v => handleFilterChange('type', v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Devices Table */}
      {devices.length === 0 ? (
        <Card><CardContent className="py-0"><EmptyState icon={HardDrive} title="Nenhum dispositivo encontrado" description="Registre dispositivos para monitorar e gerenciar a frota da empresa." /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {devices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-4 hover:bg-accent/50">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-muted">
                    {typeIcons[device.device_type] || <Monitor className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{device.name}</p>
                      <Badge variant={device.is_active ? 'default' : 'secondary'}>
                        {device.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      {device.os_name && <span>{device.os_name} {device.os_version}</span>}
                      {device.ip_address && <span>IP: {device.ip_address}</span>}
                      {(device as { employee?: { name: string } }).employee && <span>👤 {(device as { employee?: { name: string } }).employee?.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {device.last_seen && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                  {device.agent_version && (
                    <Badge variant="outline" className="text-xs">v{device.agent_version}</Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(device)}><Eye className="mr-2 h-4 w-4" />Detalhes</DropdownMenuItem>
                      {device.is_active ? (
                        <DropdownMenuItem onClick={() => handleDeactivate(device.id)}><PowerOff className="mr-2 h-4 w-4" />Desativar</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReactivate(device.id)}><Power className="mr-2 h-4 w-4" />Reativar</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(device.id)}><Trash2 className="mr-2 h-4 w-4" />Remover</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Device Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={handleCloseDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalhes do Dispositivo</DialogTitle></DialogHeader>
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-muted-foreground">Nome</label><p className="font-medium">{selectedDevice.name}</p></div>
                <div><label className="text-sm text-muted-foreground">Tipo</label><p className="capitalize">{selectedDevice.device_type}</p></div>
                <div><label className="text-sm text-muted-foreground">Sistema</label><p>{selectedDevice.os_name} {selectedDevice.os_version}</p></div>
                <div><label className="text-sm text-muted-foreground">Status</label><Badge variant={selectedDevice.is_active ? 'default' : 'secondary'}>{selectedDevice.is_active ? 'Ativo' : 'Inativo'}</Badge></div>
                <div><label className="text-sm text-muted-foreground">IP</label><p>{selectedDevice.ip_address || 'N/A'}</p></div>
                <div><label className="text-sm text-muted-foreground">MAC</label><p>{selectedDevice.mac_address || 'N/A'}</p></div>
                <div><label className="text-sm text-muted-foreground">Agent</label><p>{selectedDevice.agent_version || 'N/A'}</p></div>
                <div><label className="text-sm text-muted-foreground">Última Atividade</label><p>{selectedDevice.last_seen ? formatDistanceToNow(new Date(selectedDevice.last_seen), { addSuffix: true, locale: ptBR }) : 'N/A'}</p></div>
              </div>
              <DialogFooter className="gap-2">
                {selectedDevice.is_active ? (
                  <Button variant="outline" onClick={() => handleDeactivate(selectedDevice.id)} disabled={isDeactivating}>Desativar</Button>
                ) : (
                  <Button variant="outline" onClick={() => handleReactivate(selectedDevice.id)}>Reativar</Button>
                )}
                <Button variant="destructive" onClick={() => handleDelete(selectedDevice.id)} disabled={isDeleting}>Remover</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { DevicesPage };
