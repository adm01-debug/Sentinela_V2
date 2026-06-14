import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp, Users, Target, Search, BarChart3 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function HoursTrackingPage() {
  const [period, setPeriod] = useState('week');
  const [search, setSearch] = useState('');

  const getRange = () => {
    const now = new Date();
    if (period === 'week') return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    if (period === 'month') return { start: startOfMonth(now), end: endOfMonth(now) };
    return { start: subDays(now, 30), end: now };
  };

  const { start, end } = getRange();

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['hours-tracking', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('employee_id, clock_in, clock_out, duration_minutes, project_id, employees(name, department), projects(name, color)')
        .gte('clock_in', start.toISOString())
        .lte('clock_in', end.toISOString())
        .eq('status', 'completed')
        .order('clock_in', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Daily chart data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEntries = timeEntries.filter((e) => format(new Date(e.clock_in), 'yyyy-MM-dd') === dayStr);
      const totalMinutes = dayEntries.reduce((sum: number, e: Record<string, unknown>) => sum + (Number(e.duration_minutes) || 0), 0);
      return {
        date: format(day, 'EEE dd/MM', { locale: ptBR }),
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        meta: 8,
      };
    });
  }, [timeEntries, start, end]);

  // Employee ranking
  const employeeHours = useMemo(() => {
    const byEmp: Record<string, { name: string; department: string; minutes: number }> = {};
    timeEntries.forEach((e) => {
      const id = e.employee_id;
      if (!byEmp[id]) byEmp[id] = { name: e.employees?.name || '?', department: e.employees?.department || '', minutes: 0 };
      byEmp[id].minutes += (e.duration_minutes || 0);
    });
    return Object.entries(byEmp)
      .map(([id, data]) => ({ id, ...data, hours: Math.round(data.minutes / 60 * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours);
  }, [timeEntries]);

  // Project hours
  const projectHours = useMemo(() => {
    const byProject: Record<string, { name: string; color: string; minutes: number }> = {};
    timeEntries.forEach((e) => {
      if (!e.project_id) return;
      if (!byProject[e.project_id]) byProject[e.project_id] = { name: e.projects?.name || 'Sem projeto', color: e.projects?.color || '#94a3b8', minutes: 0 };
      byProject[e.project_id].minutes += (e.duration_minutes || 0);
    });
    return Object.entries(byProject)
      .map(([id, data]) => ({ id, ...data, hours: Math.round(data.minutes / 60 * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours);
  }, [timeEntries]);

  const totalHours = Math.round(timeEntries.reduce((sum: number, e: Record<string, unknown>) => sum + (Number(e.duration_minutes) || 0), 0) / 60);
  const uniqueEmployees = new Set(timeEntries.map((e) => e.employee_id)).size;
  const avgPerEmployee = uniqueEmployees > 0 ? Math.round(totalHours / uniqueEmployees) : 0;

  const filteredEmployees = employeeHours.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tracking de Horas"
        description="Visualização detalhada de horas trabalhadas"
        showBackButton={false}
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="30days">30 Dias</SelectItem>
            </SelectContent>
          </Select>
        }
      />


      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total de Horas</p><p className="text-2xl font-bold">{totalHours}h</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-blue-600" /><div><p className="text-sm text-muted-foreground">Funcionários Ativos</p><p className="text-2xl font-bold">{uniqueEmployees}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-green-600" /><div><p className="text-sm text-muted-foreground">Média por Funcionário</p><p className="text-2xl font-bold">{avgPerEmployee}h</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Target className="h-8 w-8 text-orange-600" /><div><p className="text-sm text-muted-foreground">Projetos Ativos</p><p className="text-2xl font-bold">{projectHours.length}</p></div></CardContent></Card>
      </div>

      {/* Daily Hours Chart */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Horas por Dia</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-center py-8">Carregando...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="hours" name="Horas Trabalhadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="meta" name="Meta (8h)" stroke="hsl(var(--destructive))" strokeDasharray="5 5" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employee Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Ranking por Funcionário</CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-auto">
              {filteredEmployees.map((emp, idx) => (
                <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.department || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{emp.hours}h</p>
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (emp.hours / (period === 'week' ? 44 : 176)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && <p className="text-muted-foreground text-center py-4">Sem dados</p>}
            </div>
          </CardContent>
        </Card>

        {/* Hours by Project */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Horas por Projeto</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-auto">
              {projectHours.map((proj) => (
                <div key={proj.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                  <p className="text-sm font-medium flex-1">{proj.name}</p>
                  <p className="text-sm font-bold">{proj.hours}h</p>
                </div>
              ))}
              {projectHours.length === 0 && <p className="text-muted-foreground text-center py-4">Sem dados de projeto</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HoursTrackingPage;
