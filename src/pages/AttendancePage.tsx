import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CalendarDays, UserCheck, UserX, AlertTriangle, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { XlsxExportButton } from '@/components/exports/XlsxExportButton';

import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useChartColors } from '@/hooks/useChartColors';

const statusConfig: Record<string, { label: string; color: string }> = {
  present: { label: 'Presente', color: 'bg-success/10 text-success' },
  absent: { label: 'Ausente', color: 'bg-destructive/10 text-destructive' },
  late: { label: 'Atrasado', color: 'bg-warning/10 text-warning' },
  early_departure: { label: 'Saída Antecipada', color: 'bg-warning/10 text-warning' },
  half_day: { label: 'Meio Período', color: 'bg-info/10 text-info' },
  holiday: { label: 'Feriado', color: 'bg-accent text-accent-foreground' },
};

function AttendancePage() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<string>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const colors = useChartColors();

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

  const filtered = allRecords.filter((r) => {
    const matchSearch = r.employees?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch !== false && matchStatus;
  });

  const stats = {
    total: allRecords.length,
    present: allRecords.filter((r) => r.status === 'present').length,
    late: allRecords.filter((r) => r.status === 'late' || (r.late_minutes || 0) > 0).length,
    absent: allRecords.filter((r) => r.status === 'absent').length,
    avgHours: allRecords.length > 0
      ? Math.round(allRecords.reduce((sum: number, r) => sum + (r.total_worked_minutes || 0), 0) / allRecords.length / 60 * 10) / 10
      : 0,
    totalOvertime: Math.round(allRecords.reduce((sum: number, r) => sum + (r.overtime_minutes || 0), 0) / 60),
  };

  const presenceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  // Daily attendance trend
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayRecords = allRecords.filter((r) => r.date === dayStr);
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        presentes: dayRecords.filter((r) => r.status === 'present').length,
        ausentes: dayRecords.filter((r) => r.status === 'absent').length,
        atrasados: dayRecords.filter((r) => r.status === 'late' || (r.late_minutes || 0) > 0).length,
      };
    }).slice(-14); // Last 14 days
  }, [allRecords, start, end]);

  // Status pie
  const statusPieData = useMemo(() => [
    { name: 'Presentes', value: stats.present, color: colors.success },
    { name: 'Ausentes', value: stats.absent, color: colors.destructive },
    { name: 'Atrasados', value: stats.late, color: colors.warning },
  ].filter(d => d.value > 0), [stats, colors]);

  // Hours distribution
  const hoursData = useMemo(() => {
    const buckets: Record<string, number> = { '< 4h': 0, '4-6h': 0, '6-8h': 0, '8-10h': 0, '> 10h': 0 };
    allRecords.forEach((r) => {
      const h = (r.total_worked_minutes || 0) / 60;
      if (h < 4) buckets['< 4h']++;
      else if (h < 6) buckets['4-6h']++;
      else if (h < 8) buckets['6-8h']++;
      else if (h < 10) buckets['8-10h']++;
      else buckets['> 10h']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [allRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Assiduidade"
        description="Atrasos, faltas, presença e horas extras"
        showBackButton={false}
        actions={
          <XlsxExportButton
            filename="assiduidade"
            sheets={[{
              name: 'Registros',
              rows: filtered.map((r) => ({
                Funcionário: r.employees?.name ?? '',
                Departamento: r.employees?.department ?? '',
                Data: r.date ?? '',
                'Entrada': r.actual_start ? new Date(r.actual_start).toLocaleTimeString('pt-BR') : '',
                'Saída': r.actual_end ? new Date(r.actual_end).toLocaleTimeString('pt-BR') : '',
                'Minutos trabalhados': r.total_worked_minutes ?? 0,
                'Atraso (min)': r.late_minutes ?? 0,
                'Saída antecipada (min)': r.early_departure_minutes ?? 0,
                'Hora extra (min)': r.overtime_minutes ?? 0,
                Status: statusConfig[String(r.status ?? '')]?.label ?? String(r.status ?? ''),
              })),
            }]}
            disabled={filtered.length === 0}
          />
        }
      />



      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card><CardContent className="p-4 text-center"><UserCheck className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">{presenceRate}%</p><p className="text-xs text-muted-foreground">Taxa Presença</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CalendarDays className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Registros</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserCheck className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold text-success">{stats.present}</p><p className="text-xs text-muted-foreground">Presentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold text-warning">{stats.late}</p><p className="text-xs text-muted-foreground">Atrasos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserX className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold text-destructive">{stats.absent}</p><p className="text-xs text-muted-foreground">Ausências</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-info mb-1" /><p className="text-2xl font-bold text-info">{stats.totalOvertime}h</p><p className="text-xs text-muted-foreground">Horas Extra</p></CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Presença Diária</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="date" tick={{ fill: colors.muted, fontSize: 10 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="presentes" name="Presentes" stroke={colors.success} fill="url(#attGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Distribuição de Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {statusPieData.map(d => (
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" name="Registros" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
              ) : filtered.slice(0, 100).map((record) => {
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
                      {(record.late_minutes || 0) > 0 ? <span className="text-warning">{record.late_minutes}min</span> : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {(record.overtime_minutes || 0) > 0 ? <span className="text-info">{Math.round(record.overtime_minutes / 60 * 10) / 10}h</span> : '—'}
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
