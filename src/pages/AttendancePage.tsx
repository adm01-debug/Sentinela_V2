import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CalendarDays, UserCheck, UserX, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string }> = {
  present: { label: 'Presente', color: 'bg-green-100 text-green-700' },
  absent: { label: 'Ausente', color: 'bg-red-100 text-red-700' },
  late: { label: 'Atrasado', color: 'bg-yellow-100 text-yellow-700' },
  early_departure: { label: 'Saída Antecipada', color: 'bg-orange-100 text-orange-700' },
  half_day: { label: 'Meio Período', color: 'bg-blue-100 text-blue-700' },
  holiday: { label: 'Feriado', color: 'bg-purple-100 text-purple-700' },
};

function AttendancePage() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<string>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getDateRange = () => {
    const now = new Date();
    if (dateRange === 'week') return { start: subDays(now, 7), end: now };
    if (dateRange === 'month') return { start: startOfMonth(now), end: endOfMonth(now) };
    return { start: subDays(now, 30), end: now };
  };

  const { start, end } = getDateRange();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance-records', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*, employees(name, department, position)')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Derive attendance from time_entries if no attendance_records exist
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['attendance-time-entries', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('employee_id, clock_in, clock_out, duration_minutes, employees(name, department)')
        .gte('clock_in', start.toISOString())
        .lte('clock_in', end.toISOString())
        .eq('status', 'completed')
        .order('clock_in', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Combine sources
  const allRecords = records.length > 0 ? records : timeEntries.map((te) => ({
    id: `te-${te.employee_id}-${te.clock_in}`,
    employee_id: te.employee_id,
    date: format(new Date(te.clock_in), 'yyyy-MM-dd'),
    actual_start: te.clock_in,
    actual_end: te.clock_out,
    total_worked_minutes: te.duration_minutes || 0,
    late_minutes: 0,
    early_departure_minutes: 0,
    overtime_minutes: Math.max(0, (te.duration_minutes || 0) - 480),
    status: 'present',
    employees: te.employees,
  }));

  const filtered = allRecords.filter((r: any) => {
    const matchSearch = r.employees?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch !== false && matchStatus;
  });

  const stats = {
    total: allRecords.length,
    present: allRecords.filter((r: any) => r.status === 'present').length,
    late: allRecords.filter((r: any) => r.status === 'late' || (r.late_minutes || 0) > 0).length,
    absent: allRecords.filter((r: any) => r.status === 'absent').length,
    avgHours: allRecords.length > 0
      ? Math.round(allRecords.reduce((sum: number, r: any) => sum + (r.total_worked_minutes || 0), 0) / allRecords.length / 60 * 10) / 10
      : 0,
    totalOvertime: Math.round(allRecords.reduce((sum: number, r: any) => sum + (r.overtime_minutes || 0), 0) / 60),
  };

  const presenceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Controle de Assiduidade</h1>
        <p className="text-muted-foreground">Atrasos, faltas, presença e horas extras</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card><CardContent className="p-4 text-center"><UserCheck className="h-5 w-5 mx-auto text-green-600 mb-1" /><p className="text-2xl font-bold">{presenceRate}%</p><p className="text-xs text-muted-foreground">Taxa Presença</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CalendarDays className="h-5 w-5 mx-auto text-blue-600 mb-1" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Registros</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserCheck className="h-5 w-5 mx-auto text-green-600 mb-1" /><p className="text-2xl font-bold text-green-600">{stats.present}</p><p className="text-xs text-muted-foreground">Presentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-yellow-600 mb-1" /><p className="text-2xl font-bold text-yellow-600">{stats.late}</p><p className="text-xs text-muted-foreground">Atrasos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserX className="h-5 w-5 mx-auto text-red-600 mb-1" /><p className="text-2xl font-bold text-red-600">{stats.absent}</p><p className="text-xs text-muted-foreground">Ausências</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-orange-600 mb-1" /><p className="text-2xl font-bold text-orange-600">{stats.totalOvertime}h</p><p className="text-xs text-muted-foreground">Horas Extra</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar funcionário..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="30days">30 Dias</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead className="text-right">Atraso</TableHead>
                <TableHead className="text-right">H. Extra</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</TableCell></TableRow>
              ) : filtered.slice(0, 100).map((record: any) => {
                const cfg = statusConfig[record.status] || statusConfig.present;
                const workedHours = Math.round((record.total_worked_minutes || 0) / 60 * 10) / 10;
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employees?.name || '—'}</TableCell>
                    <TableCell>{format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{record.actual_start ? format(new Date(record.actual_start), 'HH:mm') : '—'}</TableCell>
                    <TableCell>{record.actual_end ? format(new Date(record.actual_end), 'HH:mm') : '—'}</TableCell>
                    <TableCell className="text-right">{workedHours}h</TableCell>
                    <TableCell className="text-right">
                      {(record.late_minutes || 0) > 0 ? (
                        <span className="text-yellow-600">{record.late_minutes}min</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {(record.overtime_minutes || 0) > 0 ? (
                        <span className="text-orange-600">{Math.round(record.overtime_minutes / 60 * 10) / 10}h</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell><Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendancePage;
