import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, CheckCircle, Clock, Search, Filter, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pendente', variant: 'outline' },
  approved: { label: 'Aprovado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
};

function TimesheetsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['timesheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*, employees(name, department)')
        .order('period_start', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-timesheets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('id, name').eq('status', 'active').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Generate timesheets from time_entries
  const generateTimesheets = useMutation({
    mutationFn: async (periodType: 'weekly' | 'monthly') => {
      const now = new Date();
      let periodStart: Date, periodEnd: Date;
      if (periodType === 'weekly') {
        periodStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        periodEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      } else {
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
      }

      // Get all time entries for this period
      const { data: entries, error: entriesErr } = await supabase
        .from('time_entries')
        .select('employee_id, duration_minutes, break_minutes')
        .gte('clock_in', periodStart.toISOString())
        .lte('clock_in', periodEnd.toISOString())
        .eq('status', 'completed');
      if (entriesErr) throw entriesErr;

      // Group by employee
      const byEmployee: Record<string, { total: number; breaks: number }> = {};
      (entries || []).forEach((e: Record<string, unknown>) => {
        if (!byEmployee[e.employee_id]) byEmployee[e.employee_id] = { total: 0, breaks: 0 };
        byEmployee[e.employee_id].total += (e.duration_minutes || 0);
        byEmployee[e.employee_id].breaks += (e.break_minutes || 0);
      });

      // Create timesheets
      const inserts = Object.entries(byEmployee).map(([empId, data]) => {
        const totalHours = data.total / 60;
        const regularHours = Math.min(totalHours, periodType === 'weekly' ? 44 : 176);
        const overtimeHours = Math.max(0, totalHours - regularHours);
        return {
          employee_id: empId,
          period_type: periodType,
          period_start: format(periodStart, 'yyyy-MM-dd'),
          period_end: format(periodEnd, 'yyyy-MM-dd'),
          total_hours: Math.round(totalHours * 100) / 100,
          regular_hours: Math.round(regularHours * 100) / 100,
          overtime_hours: Math.round(overtimeHours * 100) / 100,
          break_hours: Math.round((data.breaks / 60) * 100) / 100,
          status: 'pending',
        };
      });

      if (inserts.length === 0) throw new Error('Nenhum registro de ponto encontrado no período');

      const { error } = await supabase.from('timesheets').upsert(inserts, {
        onConflict: 'employee_id,period_start,period_end',
      });
      if (error) throw error;
      return inserts.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: `${count} folhas de ponto geradas!` });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const approveTimesheet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timesheets').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: 'Folha de ponto aprovada!' });
    },
  });

  const filtered = timesheets.filter((ts: Record<string, unknown>) => {
    const matchSearch = ts.employees?.name?.toLowerCase().includes(search.toLowerCase());
    const matchPeriod = periodFilter === 'all' || ts.period_type === periodFilter;
    return matchSearch && matchPeriod;
  });

  const stats = {
    total: timesheets.length,
    pending: timesheets.filter((t: Record<string, unknown>) => t.status === 'pending').length,
    approved: timesheets.filter((t: Record<string, unknown>) => t.status === 'approved').length,
    totalHours: timesheets.reduce((sum: number, t: Record<string, unknown>) => sum + (t.total_hours || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folhas de Ponto</h1>
          <p className="text-muted-foreground">Timesheets gerados automaticamente dos registros de ponto</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateTimesheets.mutate('weekly')} disabled={generateTimesheets.isPending}>
            <Calendar className="h-4 w-4 mr-2" /> Gerar Semanal
          </Button>
          <Button onClick={() => generateTimesheets.mutate('monthly')} disabled={generateTimesheets.isPending}>
            <Calendar className="h-4 w-4 mr-2" /> Gerar Mensal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Aprovadas</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Horas Totais</p><p className="text-2xl font-bold">{Math.round(stats.totalHours)}h</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar funcionário..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
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
                <TableHead>Período</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Horas Normais</TableHead>
                <TableHead className="text-right">Horas Extra</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma folha de ponto encontrada</TableCell></TableRow>
              ) : filtered.map((ts: Record<string, unknown>) => {
                const stCfg = statusConfig[ts.status] || statusConfig.pending;
                return (
                  <TableRow key={ts.id}>
                    <TableCell className="font-medium">{ts.employees?.name || '—'}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(ts.period_start), 'dd/MM', { locale: ptBR })} - {format(new Date(ts.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell><Badge variant="outline">{ts.period_type === 'weekly' ? 'Semanal' : 'Mensal'}</Badge></TableCell>
                    <TableCell className="text-right">{ts.regular_hours}h</TableCell>
                    <TableCell className="text-right">{ts.overtime_hours > 0 ? <span className="text-orange-600">{ts.overtime_hours}h</span> : '0h'}</TableCell>
                    <TableCell className="text-right font-medium">{ts.total_hours}h</TableCell>
                    <TableCell><Badge variant={stCfg.variant}>{stCfg.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      {ts.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => approveTimesheet.mutate(ts.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                        </Button>
                      )}
                    </TableCell>
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

export default TimesheetsPage;
