import { Search, Monitor, Wifi, WifiOff, Clock, Users, Grid, List, RefreshCw, Keyboard, MousePointer2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useMonitoringPage, type MonitoringEmployee } from '@/hooks/useMonitoringPage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
};

const statusLabels: Record<string, string> = {
  online: 'Online',
  idle: 'Ocioso',
  busy: 'Ocupado',
  offline: 'Offline',
};

export default function MonitoringPage() {
  const {
    selectedEmployee, viewMode, setViewMode,
    statusFilter, setStatusFilter,
    departmentFilter, setDepartmentFilter,
    searchTerm, setSearchTerm,
    autoRefresh, setAutoRefresh,
    employees, departments, activitySummary,
    stats, isLoadingEmployees,
    handleSelectEmployee,
  } = useMonitoringPage();

  if (isLoadingEmployees) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento em Tempo Real</h1>
          <p className="text-muted-foreground mt-1">Acompanhe a atividade dos funcionários</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
          </div>
          <div className="flex gap-1">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 text-center"><Users className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-2xl font-bold mt-1">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Wifi className="h-5 w-5 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{stats.online}</p><p className="text-xs text-muted-foreground">Online</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Clock className="h-5 w-5 mx-auto text-yellow-500" /><p className="text-2xl font-bold mt-1">{stats.idle}</p><p className="text-xs text-muted-foreground">Ociosos</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Monitor className="h-5 w-5 mx-auto text-red-500" /><p className="text-2xl font-bold mt-1">{stats.busy}</p><p className="text-xs text-muted-foreground">Ocupados</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><WifiOff className="h-5 w-5 mx-auto text-gray-400" /><p className="text-2xl font-bold mt-1">{stats.offline}</p><p className="text-xs text-muted-foreground">Offline</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar funcionário..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="idle">Ocioso</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid/List */}
      {employees.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum funcionário encontrado.</p></CardContent></Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <Card key={emp.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectEmployee(emp)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColors[emp.status]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">{emp.department}</p>
                  </div>
                  <Badge variant="outline">{statusLabels[emp.status]}</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Produtividade</span>
                    <span className="font-medium">{emp.productivity_score}%</span>
                  </div>
                  <Progress value={emp.productivity_score} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Última atividade: {formatDistanceToNow(new Date(emp.last_activity), { addSuffix: true, locale: ptBR })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {employees.map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer" onClick={() => handleSelectEmployee(emp)}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColors[emp.status]}`} />
                  </div>
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">{emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{emp.department}</span>
                  <Badge variant="outline">{statusLabels[emp.status]}</Badge>
                  <span className="text-sm font-medium">{emp.productivity_score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Employee Detail Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={() => handleSelectEmployee(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedEmployee?.name}</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16"><AvatarFallback className="text-xl">{selectedEmployee.name.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedEmployee.name}</p>
                  <p className="text-muted-foreground">{selectedEmployee.email}</p>
                  <Badge className="mt-1" variant="outline">{statusLabels[selectedEmployee.status]}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card><CardContent className="pt-4 text-center"><Keyboard className="h-5 w-5 mx-auto text-primary" /><p className="text-xl font-bold mt-1">{activitySummary?.total_keystrokes || 0}</p><p className="text-xs text-muted-foreground">Teclas hoje</p></CardContent></Card>
                <Card><CardContent className="pt-4 text-center"><MousePointer2 className="h-5 w-5 mx-auto text-primary" /><p className="text-xl font-bold mt-1">{activitySummary?.total_clicks || 0}</p><p className="text-xs text-muted-foreground">Cliques hoje</p></CardContent></Card>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tempo Ativo vs Ocioso</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ativo</span>
                    <span>{Math.round((activitySummary?.total_active_time || 0) / 60)}min</span>
                  </div>
                  <Progress value={activitySummary ? (activitySummary.total_active_time / (activitySummary.total_active_time + activitySummary.total_idle_time || 1)) * 100 : 0} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Ocioso</span>
                    <span>{Math.round((activitySummary?.total_idle_time || 0) / 60)}min</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { MonitoringPage };
