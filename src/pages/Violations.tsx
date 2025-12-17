import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Calendar,
  ShieldAlert,
  Bell,
  CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SimulateViolationButton } from '@/components/SimulateViolationButton';
import { ViolationsTrendChart } from '@/components/ViolationsTrendChart';
import { ViolationsByTypeChart } from '@/components/ViolationsByTypeChart';
import { ViolationsBySeverityChart } from '@/components/ViolationsBySeverityChart';
import { ViolationsByEmployeeChart } from '@/components/ViolationsByEmployeeChart';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Violation {
  id: string;
  employee_name: string;
  policy_name: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string | null;
  device: string | null;
  ip_address: string | null;
  read: boolean;
  created_at: string;
}

const severityConfig = {
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Baixa'
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    label: 'Média'
  },
  high: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    label: 'Alta'
  },
  critical: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    label: 'Crítica'
  }
};

export default function Violations() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Get unique values for filters
  const violationTypes = useMemo(() => [...new Set(violations.map(v => v.violation_type))], [violations]);
  const employees = useMemo(() => [...new Set(violations.map(v => v.employee_name))], [violations]);

  useEffect(() => {
    fetchViolations();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('violations-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_violations'
        },
        () => {
          fetchViolations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setViolations((data || []).map(v => ({
        ...v,
        severity: v.severity as Violation['severity']
      })));
    } catch (error: any) {
      toast.error('Erro ao carregar violações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('security_violations')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setViolations(prev => prev.map(v => v.id === id ? { ...v, read: true } : v));
    } catch (error: any) {
      toast.error('Erro ao marcar como lida: ' + error.message);
    }
  };

  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      v.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.device?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && v.read) || 
      (statusFilter === 'unread' && !v.read);
    
    const matchesType = typeFilter === 'all' || v.violation_type === typeFilter;
    const matchesEmployee = employeeFilter === 'all' || v.employee_name === employeeFilter;
    
    const violationDate = new Date(v.created_at);
    const matchesDateFrom = !dateFrom || violationDate >= dateFrom;
    const matchesDateTo = !dateTo || violationDate <= new Date(dateTo.getTime() + 86400000);

    return matchesSearch && matchesSeverity && matchesStatus && matchesType && matchesEmployee && matchesDateFrom && matchesDateTo;
  });

  const markAllAsRead = async () => {
    const unreadIds = violations.filter(v => !v.read).map(v => v.id);
    if (unreadIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('security_violations')
        .update({ read: true })
        .in('id', unreadIds);
      
      if (error) throw error;
      setViolations(prev => prev.map(v => ({ ...v, read: true })));
      toast.success('Todas as violações marcadas como lidas');
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const stats = {
    total: violations.length,
    critical: violations.filter(v => v.severity === 'critical').length,
    high: violations.filter(v => v.severity === 'high').length,
    unread: violations.filter(v => !v.read).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="pl-64">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Violações de Segurança</h1>
              <p className="text-muted-foreground">Monitore e gerencie todas as violações detectadas</p>
            </div>
            <div className="flex items-center gap-2">
              <SimulateViolationButton />
              <Button variant="outline" size="sm" onClick={fetchViolations} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Atualizar
              </Button>
              {stats.unread > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas lidas
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total de Violações</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-muted-foreground">Críticas</p>
              <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
            </div>
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
              <p className="text-sm text-muted-foreground">Alta Severidade</p>
              <p className="text-3xl font-bold text-orange-500">{stats.high}</p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Não Lidas</p>
              <p className="text-3xl font-bold text-primary">{stats.unread}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ViolationsByTypeChart violations={violations} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Por Severidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ViolationsBySeverityChart violations={violations} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Por Funcionário (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ViolationsByEmployeeChart violations={violations} />
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <ViolationsTrendChart violations={violations} />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por colaborador, política, dispositivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {violationTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Funcionário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[150px] justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'dd/MM/yy') : 'Data início'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[150px] justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, 'dd/MM/yy') : 'Data fim'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {(dateFrom || dateTo || severityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || employeeFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  setSeverityFilter('all');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setEmployeeFilter('all');
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Política</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredViolations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma violação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredViolations.map((violation) => {
                    const config = severityConfig[violation.severity];
                    const Icon = config.icon;
                    
                    return (
                      <TableRow key={violation.id} className={cn(!violation.read && 'bg-primary/5')}>
                        <TableCell>
                          {violation.read ? (
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('gap-1', config.color, config.border)}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{violation.employee_name}</TableCell>
                        <TableCell>{violation.policy_name}</TableCell>
                        <TableCell>{violation.violation_type}</TableCell>
                        <TableCell className="text-muted-foreground">{violation.device || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(violation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {!violation.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(violation.id)}
                            >
                              Marcar lida
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredViolations.length} de {violations.length} violações
          </p>
        </main>
      </div>
    </div>
  );
}
