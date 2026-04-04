import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Play, Square, Coffee, Users, Timer, TrendingUp, Search, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeStatusRow {
  id: string;
  employee_id: string;
  status: string;
  current_task: string | null;
  current_project: string | null;
  last_activity_at: string | null;
  clock_in_at: string | null;
  total_today_minutes: number | null;
  idle_minutes: number | null;
  updated_at: string;
  employees?: { id: string; name: string; department: string | null; position: string | null; avatar_url: string | null };
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  online: { label: 'Online', color: 'bg-green-500', icon: '🟢' },
  idle: { label: 'Ocioso', color: 'bg-yellow-500', icon: '🟡' },
  break: { label: 'Em Pausa', color: 'bg-blue-500', icon: '⏸️' },
  offline: { label: 'Offline', color: 'bg-gray-400', icon: '🔴' },
};

function TimeClockPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch employee statuses with employee details
  const { data: statuses = [], isLoading } = useQuery({
    queryKey: ['employee-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_status')
        .select('*, employees(id, name, department, position, avatar_url)')
        .order('status', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as EmployeeStatusRow[];
    },
    refetchInterval: 15000,
  });

  // Fetch all employees to show those without status
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees-for-clock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, department, position, avatar_url, status')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch active time entries
  const { data: activeEntries = [] } = useQuery({
    queryKey: ['active-time-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('status', 'active')
        .is('clock_out', null);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Clock in mutation
  const clockIn = useMutation({
    mutationFn: async (employeeId: string) => {
      // Create time entry
      const { error: teError } = await supabase.from('time_entries').insert({
        employee_id: employeeId,
        clock_in: new Date().toISOString(),
        status: 'active',
      });
      if (teError) throw teError;

      // Upsert employee status
      const { error: esError } = await supabase.from('employee_status').upsert({
        employee_id: employeeId,
        status: 'online',
        clock_in_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'employee_id' });
      if (esError) throw esError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-status'] });
      queryClient.invalidateQueries({ queryKey: ['active-time-entries'] });
      toast({ title: 'Clock-in realizado com sucesso!' });
    },
    onError: (err: Error) => toast({ title: 'Erro ao fazer clock-in', description: err.message, variant: 'destructive' }),
  });

  // Clock out mutation
  const clockOut = useMutation({
    mutationFn: async (employeeId: string) => {
      const activeEntry = activeEntries.find((e: any) => e.employee_id === employeeId);
      if (activeEntry) {
        const duration = differenceInMinutes(new Date(), new Date(activeEntry.clock_in));
        const { error } = await supabase.from('time_entries').update({
          clock_out: new Date().toISOString(),
          duration_minutes: duration,
          status: 'completed',
          updated_at: new Date().toISOString(),
        }).eq('id', activeEntry.id);
        if (error) throw error;
      }

      const { error: esError } = await supabase.from('employee_status').upsert({
        employee_id: employeeId,
        status: 'offline',
        clock_in_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'employee_id' });
      if (esError) throw esError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-status'] });
      queryClient.invalidateQueries({ queryKey: ['active-time-entries'] });
      toast({ title: 'Clock-out realizado com sucesso!' });
    },
    onError: (err: Error) => toast({ title: 'Erro ao fazer clock-out', description: err.message, variant: 'destructive' }),
  });

  // Realtime subscription for status changes
  useEffect(() => {
    const channel = supabase
      .channel('employee-status-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employee_status' }, () => {
        queryClient.invalidateQueries({ queryKey: ['employee-status'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Merge employees with status
  const employeesWithStatus = allEmployees.map((emp: any) => {
    const statusRow = statuses.find(s => s.employee_id === emp.id);
    return {
      ...emp,
      currentStatus: statusRow?.status || 'offline',
      clockInAt: statusRow?.clock_in_at,
      totalMinutes: statusRow?.total_today_minutes || 0,
      currentTask: statusRow?.current_task,
      currentProject: statusRow?.current_project,
      lastActivity: statusRow?.last_activity_at,
      isClockedIn: activeEntries.some((e: any) => e.employee_id === emp.id),
    };
  });

  const filtered = employeesWithStatus.filter((e: any) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || e.currentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    online: employeesWithStatus.filter((e: any) => e.currentStatus === 'online').length,
    idle: employeesWithStatus.filter((e: any) => e.currentStatus === 'idle').length,
    break: employeesWithStatus.filter((e: any) => e.currentStatus === 'break').length,
    offline: employeesWithStatus.filter((e: any) => e.currentStatus === 'offline').length,
  };

  const formatMinutes = (mins: any) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ponto Digital</h1>
        <p className="text-muted-foreground">Controle de entrada/saída e status em tempo real</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${filterStatus === key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterStatus(filterStatus === key ? null : key)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{cfg.label}</p>
                <p className="text-2xl font-bold">{counts[key as keyof typeof counts]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar funcionário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quadro de Status ({filtered.length} funcionários)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum funcionário encontrado</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((emp: any) => {
                const cfg = statusConfig[emp.currentStatus] || statusConfig.offline;
                return (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {emp.avatar_url ? (
                          <img src={emp.avatar_url} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          emp.name.split(' ').map((n: number) => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{emp.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.department || emp.position || '—'}</p>
                      {emp.isClockedIn && emp.clockInAt && (
                        <p className="text-xs text-green-600 mt-0.5">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Desde {format(new Date(emp.clockInAt), 'HH:mm', { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {cfg.icon} {cfg.label}
                      </Badge>
                      {emp.isClockedIn ? (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => clockOut.mutate(emp.id)}>
                          <Square className="h-3 w-3 mr-1" /> Saída
                        </Button>
                      ) : (
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => clockIn.mutate(emp.id)}>
                          <Play className="h-3 w-3 mr-1" /> Entrada
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TimeClockPage;
