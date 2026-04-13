import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes } from 'date-fns';
import { EmployeeStatusCard, statusConfig, type StatusKey } from './time-clock/EmployeeStatusCard';

interface EmployeeStatusRow {
  id: string; employee_id: string; status: string; current_task: string | null;
  current_project: string | null; last_activity_at: string | null; clock_in_at: string | null;
  total_today_minutes: number | null; idle_minutes: number | null; updated_at: string;
  employees?: { id: string; name: string; department: string | null; position: string | null; avatar_url: string | null };
}

interface TimeEntry { id: string; employee_id: string; clock_in: string; clock_out: string | null; status: string; duration_minutes: number | null; }
interface Employee { id: string; name: string; department: string | null; position: string | null; avatar_url: string | null; status: string; }

function TimeClockSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-9 w-48" /><Skeleton className="h-5 w-72 mt-1" /></div>
      <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4 flex items-center gap-3"><Skeleton className="w-3 h-3 rounded-full" /><div><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-10 mt-1" /></div></CardContent></Card>
      ))}</div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Card><CardHeader><Skeleton className="h-6 w-56" /></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border"><Skeleton className="w-10 h-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20 mt-1" /></div><Skeleton className="h-7 w-16" /></div>
      ))}</div></CardContent></Card>
    </div>
  );
}

function TimeClockPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusKey | null>(null);

  const { data: statuses = [], isLoading } = useQuery({
    queryKey: ['employee-status'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employee_status').select('*, employees(id, name, department, position, avatar_url)').order('status', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as EmployeeStatusRow[];
    },
    refetchInterval: 15000,
  });

  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees-for-clock'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('id, name, department, position, avatar_url, status').eq('status', 'active').order('name');
      if (error) throw error;
      return (data || []) as Employee[];
    },
  });

  const { data: activeEntries = [] } = useQuery({
    queryKey: ['active-time-entries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_entries').select('*').eq('status', 'active').is('clock_out', null);
      if (error) throw error;
      return (data || []) as TimeEntry[];
    },
    refetchInterval: 30000,
  });

  const clockIn = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error: teError } = await supabase.from('time_entries').insert({ employee_id: employeeId, clock_in: new Date().toISOString(), status: 'active' });
      if (teError) throw teError;
      const { error: esError } = await supabase.from('employee_status').upsert({ employee_id: employeeId, status: 'online', clock_in_at: new Date().toISOString(), last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'employee_id' });
      if (esError) throw esError;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employee-status'] }); queryClient.invalidateQueries({ queryKey: ['active-time-entries'] }); toast({ title: 'Clock-in realizado com sucesso!' }); },
    onError: (err: Error) => toast({ title: 'Erro ao fazer clock-in', description: err.message, variant: 'destructive' }),
  });

  const clockOut = useMutation({
    mutationFn: async (employeeId: string) => {
      const activeEntry = activeEntries.find((e) => e.employee_id === employeeId);
      if (activeEntry) {
        const duration = differenceInMinutes(new Date(), new Date(activeEntry.clock_in));
        const { error } = await supabase.from('time_entries').update({ clock_out: new Date().toISOString(), duration_minutes: duration, status: 'completed', updated_at: new Date().toISOString() }).eq('id', activeEntry.id);
        if (error) throw error;
      }
      const { error: esError } = await supabase.from('employee_status').upsert({ employee_id: employeeId, status: 'offline', clock_in_at: null, updated_at: new Date().toISOString() }, { onConflict: 'employee_id' });
      if (esError) throw esError;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employee-status'] }); queryClient.invalidateQueries({ queryKey: ['active-time-entries'] }); toast({ title: 'Clock-out realizado com sucesso!' }); },
    onError: (err: Error) => toast({ title: 'Erro ao fazer clock-out', description: err.message, variant: 'destructive' }),
  });

  useEffect(() => {
    const channel = supabase.channel('employee-status-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'employee_status' }, () => {
      queryClient.invalidateQueries({ queryKey: ['employee-status'] });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const employeesWithStatus = allEmployees.map((emp) => {
    const statusRow = statuses.find((s) => s.employee_id === emp.id);
    return { ...emp, currentStatus: (statusRow?.status || 'offline') as StatusKey, clockInAt: statusRow?.clock_in_at, totalMinutes: statusRow?.total_today_minutes || 0, currentTask: statusRow?.current_task, currentProject: statusRow?.current_project, lastActivity: statusRow?.last_activity_at, isClockedIn: activeEntries.some((e) => e.employee_id === emp.id) };
  });

  const filtered = employeesWithStatus.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || e.currentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts: Record<StatusKey, number> = {
    online: employeesWithStatus.filter((e) => e.currentStatus === 'online').length,
    idle: employeesWithStatus.filter((e) => e.currentStatus === 'idle').length,
    break: employeesWithStatus.filter((e) => e.currentStatus === 'break').length,
    offline: employeesWithStatus.filter((e) => e.currentStatus === 'offline').length,
  };

  if (isLoading) return <TimeClockSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ponto Digital</h1>
        <p className="text-muted-foreground">Controle de entrada/saída e status em tempo real</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(Object.entries(statusConfig) as [StatusKey, (typeof statusConfig)[StatusKey]][]).map(([key, cfg]) => (
          <Card key={key} className={`cursor-pointer card-hover transition-all ${filterStatus === key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterStatus(filterStatus === key ? null : key)} role="button" aria-pressed={filterStatus === key} aria-label={`Filtrar por ${cfg.label}`} tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFilterStatus(filterStatus === key ? null : key); } }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${cfg.dotClass}`} aria-hidden="true" />
              <div><p className="text-sm text-muted-foreground">{cfg.label}</p><p className="text-2xl font-bold">{counts[key]}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input placeholder="Buscar funcionário..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" aria-label="Buscar funcionário por nome" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" aria-hidden="true" />Quadro de Status ({filtered.length} funcionários)</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-4"><UserX className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="font-semibold text-foreground">Nenhum funcionário encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">{search ? `Nenhum resultado para "${search}". Tente outro termo.` : 'Nenhum funcionário ativo cadastrado no sistema.'}</p>
              {(search || filterStatus) && <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setFilterStatus(null); }}>Limpar filtros</Button>}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((emp) => (
                <EmployeeStatusCard key={emp.id} employee={emp} onClockIn={(id) => clockIn.mutate(id)} onClockOut={(id) => clockOut.mutate(id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TimeClockPage;
