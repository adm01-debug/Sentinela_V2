import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Activity,
  Zap,
  MousePointer,
  Keyboard,
  Target,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

interface PeriodData {
  label: string;
  startDate: Date;
  endDate: Date;
  productiveHours: number;
  unproductiveHours: number;
  neutralHours: number;
  totalHours: number;
  productivityRate: number;
  violationsCount: number;
  criticalViolations: number;
  keystrokesCount: number;
  clicksCount: number;
  employeesActive: number;
  avgDailyHours: number;
  efficiencyScore: number;
  focusScore: number;
  topApps: { name: string; hours: number }[];
  dailyTrend: { date: string; productive: number; total: number }[];
  byDepartment: { department: string; productivity: number; hours: number }[];
  byTeam: { team: string; productivity: number; employees: number }[];
}

interface Team {
  id: string;
  name: string;
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '14d', label: 'Últimos 14 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '60d', label: 'Últimos 60 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês anterior' },
  { value: 'quarter', label: 'Este trimestre' },
];

const COMPARISON_MODES = [
  { value: 'period', label: 'Períodos' },
  { value: 'team', label: 'Equipes' },
];

export default function ProductivityComparison() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comparisonMode, setComparisonMode] = useState('period');
  const [period1, setPeriod1] = useState('7d');
  const [period2, setPeriod2] = useState('14d');
  const [selectedTeam1, setSelectedTeam1] = useState<string>('all');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [data1, setData1] = useState<PeriodData | null>(null);
  const [data2, setData2] = useState<PeriodData | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  const getPeriodDates = (period: string): { start: Date; end: Date; label: string } => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    let label = '';

    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        label = 'Últimos 7 dias';
        break;
      case '14d':
        start.setDate(start.getDate() - 14);
        label = 'Últimos 14 dias';
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        label = 'Últimos 30 dias';
        break;
      case '60d':
        start.setDate(start.getDate() - 60);
        label = 'Últimos 60 dias';
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        label = 'Últimos 90 dias';
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        label = 'Este mês';
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end.setDate(0);
        label = 'Mês anterior';
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        label = 'Este trimestre';
        break;
      default:
        start.setDate(start.getDate() - 7);
        label = 'Últimos 7 dias';
    }

    return { start, end, label };
  };

  const fetchTeamsAndDepartments = async () => {
    const [teamsRes, employeesRes] = await Promise.all([
      supabase.from('teams').select('id, name'),
      supabase.from('employees').select('department').not('department', 'is', null)
    ]);
    
    setTeams(teamsRes.data || []);
    const uniqueDepts = [...new Set((employeesRes.data || []).map(e => e.department).filter(Boolean))];
    setDepartments(uniqueDepts as string[]);
  };

  const fetchPeriodData = async (
    period: string, 
    teamFilter?: string,
    deptFilter?: string
  ): Promise<PeriodData> => {
    const { start, end, label } = getPeriodDates(period);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Build employee filter based on team/department
    let employeeNames: string[] | null = null;
    
    if (teamFilter && teamFilter !== 'all') {
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('employee_name')
        .eq('team_id', teamFilter);
      employeeNames = (teamMembers || []).map(m => m.employee_name);
    }
    
    if (deptFilter && deptFilter !== 'all') {
      const { data: employees } = await supabase
        .from('employees')
        .select('name')
        .eq('department', deptFilter);
      const deptEmployees = (employees || []).map(e => e.name);
      employeeNames = employeeNames 
        ? employeeNames.filter(n => deptEmployees.includes(n))
        : deptEmployees;
    }

    // Build queries
    let productivityQuery = supabase
      .from('productivity_logs')
      .select('*')
      .gte('recorded_date', startStr)
      .lte('recorded_date', endStr);
      
    let violationsQuery = supabase
      .from('security_violations')
      .select('id, severity')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
      
    let keystrokesQuery = supabase
      .from('keystroke_logs')
      .select('employee_name, keystrokes_count, recorded_at')
      .gte('recorded_at', start.toISOString())
      .lte('recorded_at', end.toISOString());
      
    let clicksQuery = supabase
      .from('click_logs')
      .select('id, employee_name')
      .gte('recorded_at', start.toISOString())
      .lte('recorded_at', end.toISOString());

    if (employeeNames && employeeNames.length > 0) {
      productivityQuery = productivityQuery.in('employee_name', employeeNames);
      violationsQuery = violationsQuery.in('employee_name', employeeNames);
      keystrokesQuery = keystrokesQuery.in('employee_name', employeeNames);
      clicksQuery = clicksQuery.in('employee_name', employeeNames);
    }

    const [productivityRes, violationsRes, keystrokesRes, clicksRes] = await Promise.all([
      productivityQuery,
      violationsQuery,
      keystrokesQuery,
      clicksQuery
    ]);

    const productivity = productivityRes.data || [];
    const violations = violationsRes.data || [];
    const keystrokes = keystrokesRes.data || [];
    const clicks = clicksRes.data || [];

    const productiveSeconds = productivity.reduce((acc, p) => acc + (p.productive_time_seconds || 0), 0);
    const unproductiveSeconds = productivity.reduce((acc, p) => acc + (p.unproductive_time_seconds || 0), 0);
    const neutralSeconds = productivity.reduce((acc, p) => acc + (p.neutral_time_seconds || 0), 0);
    const totalSeconds = productiveSeconds + unproductiveSeconds + neutralSeconds;

    const uniqueEmployees = new Set(productivity.map(p => p.employee_name));
    const totalKeystrokes = keystrokes.reduce((acc, k) => acc + (k.keystrokes_count || 0), 0);
    const totalClicks = clicks.length;
    const criticalViolations = violations.filter(v => v.severity === 'critical' || v.severity === 'high').length;

    // Calculate days in period
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const avgDailyHours = totalSeconds / 3600 / daysInPeriod;

    // Calculate efficiency and focus scores
    const efficiencyScore = totalSeconds > 0 
      ? Math.round((productiveSeconds / (productiveSeconds + unproductiveSeconds || 1)) * 100) 
      : 0;
    const focusScore = Math.min(100, Math.round((totalKeystrokes / (daysInPeriod * 5000)) * 100));

    // Aggregate apps used
    const appsMap = new Map<string, number>();
    productivity.forEach(p => {
      const apps = p.apps_used as any[];
      if (Array.isArray(apps)) {
        apps.forEach((app: any) => {
          if (app?.name) {
            appsMap.set(app.name, (appsMap.get(app.name) || 0) + (app.time || 0));
          }
        });
      }
    });

    const topApps = Array.from(appsMap.entries())
      .map(([name, seconds]) => ({ name, hours: Math.round(seconds / 3600 * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    // Daily trend
    const dailyMap = new Map<string, { productive: number; total: number }>();
    productivity.forEach(p => {
      const date = p.recorded_date;
      const existing = dailyMap.get(date) || { productive: 0, total: 0 };
      existing.productive += p.productive_time_seconds || 0;
      existing.total += (p.productive_time_seconds || 0) + (p.unproductive_time_seconds || 0) + (p.neutral_time_seconds || 0);
      dailyMap.set(date, existing);
    });

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        productive: Math.round(data.productive / 3600 * 10) / 10,
        total: Math.round(data.total / 3600 * 10) / 10
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    // By department
    const deptMap = new Map<string, { productive: number; total: number }>();
    for (const p of productivity) {
      const { data: emp } = await supabase
        .from('employees')
        .select('department')
        .eq('name', p.employee_name)
        .maybeSingle();
      
      const dept = emp?.department || 'Sem departamento';
      const existing = deptMap.get(dept) || { productive: 0, total: 0 };
      existing.productive += p.productive_time_seconds || 0;
      existing.total += (p.productive_time_seconds || 0) + (p.unproductive_time_seconds || 0) + (p.neutral_time_seconds || 0);
      deptMap.set(dept, existing);
    }

    const byDepartment = Array.from(deptMap.entries())
      .map(([department, data]) => ({
        department,
        productivity: data.total > 0 ? Math.round((data.productive / data.total) * 100) : 0,
        hours: Math.round(data.total / 3600 * 10) / 10
      }))
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 6);

    // By team (simplified)
    const byTeam: { team: string; productivity: number; employees: number }[] = [];

    return {
      label,
      startDate: start,
      endDate: end,
      productiveHours: Math.round(productiveSeconds / 3600 * 10) / 10,
      unproductiveHours: Math.round(unproductiveSeconds / 3600 * 10) / 10,
      neutralHours: Math.round(neutralSeconds / 3600 * 10) / 10,
      totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
      productivityRate: totalSeconds > 0 ? Math.round((productiveSeconds / totalSeconds) * 100) : 0,
      violationsCount: violations.length,
      criticalViolations,
      keystrokesCount: totalKeystrokes,
      clicksCount: totalClicks,
      employeesActive: uniqueEmployees.size,
      avgDailyHours: Math.round(avgDailyHours * 10) / 10,
      efficiencyScore,
      focusScore,
      topApps,
      dailyTrend,
      byDepartment,
      byTeam
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchTeamsAndDepartments();
      
      const teamFilter = comparisonMode === 'team' ? selectedTeam1 : undefined;
      const teamFilter2 = comparisonMode === 'team' ? selectedTeam2 : undefined;
      
      const [d1, d2] = await Promise.all([
        fetchPeriodData(period1, teamFilter, selectedDepartment !== 'all' ? selectedDepartment : undefined),
        fetchPeriodData(period2, teamFilter2, selectedDepartment !== 'all' ? selectedDepartment : undefined)
      ]);
      setData1(d1);
      setData2(d2);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period1, period2, comparisonMode, selectedTeam1, selectedTeam2, selectedDepartment]);

  const radarData = useMemo(() => {
    if (!data1 || !data2) return [];
    
    return [
      { metric: 'Produtividade', A: data1.productivityRate, B: data2.productivityRate, fullMark: 100 },
      { metric: 'Eficiência', A: data1.efficiencyScore, B: data2.efficiencyScore, fullMark: 100 },
      { metric: 'Foco', A: data1.focusScore, B: data2.focusScore, fullMark: 100 },
      { metric: 'Atividade', A: Math.min(100, (data1.avgDailyHours / 8) * 100), B: Math.min(100, (data2.avgDailyHours / 8) * 100), fullMark: 100 },
      { metric: 'Segurança', A: Math.max(0, 100 - data1.violationsCount * 5), B: Math.max(0, 100 - data2.violationsCount * 5), fullMark: 100 },
    ];
  }, [data1, data2]);

  const getChangeIndicator = (val1: number, val2: number, inverse = false) => {
    const diff = val1 - val2;
    const pct = val2 !== 0 ? Math.round((diff / val2) * 100) : 0;
    const isPositive = inverse ? diff < 0 : diff > 0;
    
    if (diff === 0) return { icon: Minus, color: 'text-muted-foreground', text: 'Igual', pct: 0 };
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-success' : 'text-destructive',
      text: isPositive ? 'Melhor' : 'Pior',
      pct: Math.abs(pct)
    };
  };

  const handleExport = () => {
    if (!data1 || !data2) return;
    
    const exportData = {
      periodo1: {
        label: data1.label,
        produtividade: data1.productivityRate,
        horasTotais: data1.totalHours,
        horasProdutivas: data1.productiveHours,
        violacoes: data1.violationsCount,
        funcionariosAtivos: data1.employeesActive,
        mediaHorasDia: data1.avgDailyHours
      },
      periodo2: {
        label: data2.label,
        produtividade: data2.productivityRate,
        horasTotais: data2.totalHours,
        horasProdutivas: data2.productiveHours,
        violacoes: data2.violationsCount,
        funcionariosAtivos: data2.employeesActive,
        mediaHorasDia: data2.avgDailyHours
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparativo-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparativo de Produtividade
            </h1>
            <p className="text-sm text-muted-foreground">Compare métricas entre diferentes períodos e equipes</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Filters Section */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filtros</span>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Modo de Comparação</label>
              <Select value={comparisonMode} onValueChange={setComparisonMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPARISON_MODES.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {comparisonMode === 'team' && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Equipe 1</label>
                  <Select value={selectedTeam1} onValueChange={setSelectedTeam1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Equipe 2</label>
                  <Select value={selectedTeam2} onValueChange={setSelectedTeam2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Period Selectors */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Período 1</span>
              <Badge className="bg-primary text-primary-foreground ml-auto">Referência</Badge>
            </div>
            <Select value={period1} onValueChange={setPeriod1}>
              <SelectTrigger className="border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border-2 border-secondary bg-secondary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-secondary-foreground" />
              <span className="font-medium">Período 2</span>
              <Badge variant="secondary" className="ml-auto">Comparação</Badge>
            </div>
            <Select value={period2} onValueChange={setPeriod2}>
              <SelectTrigger className="border-secondary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {data1 && data2 && (
          <>
            {/* Summary Cards - Extended */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Produtividade', val1: data1.productivityRate, val2: data2.productivityRate, suffix: '%', icon: TrendingUp, color: 'text-primary' },
                { label: 'Eficiência', val1: data1.efficiencyScore, val2: data2.efficiencyScore, suffix: '%', icon: Target, color: 'text-success' },
                { label: 'Média Diária', val1: data1.avgDailyHours, val2: data2.avgDailyHours, suffix: 'h', icon: Clock, color: 'text-blue-500' },
                { label: 'Foco', val1: data1.focusScore, val2: data2.focusScore, suffix: '%', icon: Zap, color: 'text-yellow-500' },
                { label: 'Violações', val1: data1.violationsCount, val2: data2.violationsCount, suffix: '', icon: AlertTriangle, color: 'text-destructive', inverse: true },
                { label: 'Funcionários', val1: data1.employeesActive, val2: data2.employeesActive, suffix: '', icon: Users, color: 'text-purple-500' },
              ].map((metric, idx) => {
                const change = getChangeIndicator(metric.val1, metric.val2, metric.inverse);
                return (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="text-xs">{metric.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-bold">{metric.val1}{metric.suffix}</p>
                        <p className="text-xs text-muted-foreground">vs {metric.val2}{metric.suffix}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${change.color}`}>
                        <change.icon className="h-3 w-3" />
                        <span className="text-xs font-medium">{change.pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Extended Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Teclas Digitadas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{data1.keystrokesCount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">vs {data2.keystrokesCount.toLocaleString()}</span>
                </div>
                <Progress value={(data1.keystrokesCount / Math.max(data1.keystrokesCount, data2.keystrokesCount)) * 100} className="mt-2" />
              </div>
              
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cliques</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{data1.clicksCount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">vs {data2.clicksCount.toLocaleString()}</span>
                </div>
                <Progress value={(data1.clicksCount / Math.max(data1.clicksCount, data2.clicksCount, 1)) * 100} className="mt-2" />
              </div>
              
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Violações Críticas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-destructive">{data1.criticalViolations}</span>
                  <span className="text-sm text-muted-foreground">vs {data2.criticalViolations}</span>
                </div>
                <Progress value={(data1.criticalViolations / Math.max(data1.criticalViolations, data2.criticalViolations, 1)) * 100} className="mt-2 [&>div]:bg-destructive" />
              </div>
              
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Horas Totais</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{data1.totalHours}h</span>
                  <span className="text-sm text-muted-foreground">vs {data2.totalHours}h</span>
                </div>
                <Progress value={(data1.totalHours / Math.max(data1.totalHours, data2.totalHours, 1)) * 100} className="mt-2" />
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="trends">Tendências</TabsTrigger>
                <TabsTrigger value="breakdown">Detalhamento</TabsTrigger>
                <TabsTrigger value="departments">Departamentos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Comparativo Multimétrica</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Radar name={data1.label} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                          <Radar name={data2.label} dataKey="B" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} />
                          <Legend />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Time Distribution */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Distribuição de Tempo</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[
                            { category: 'Produtivo', [data1.label]: data1.productiveHours, [data2.label]: data2.productiveHours },
                            { category: 'Improdutivo', [data1.label]: data1.unproductiveHours, [data2.label]: data2.unproductiveHours },
                            { category: 'Neutro', [data1.label]: data1.neutralHours, [data2.label]: data2.neutralHours },
                          ]} 
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="category" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`${value}h`, '']}
                          />
                          <Legend />
                          <Bar dataKey={data1.label} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          <Bar dataKey={data2.label} fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6 mt-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">Tendência de Produtividade - {data1.label}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data1.dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="total" stackId="1" stroke="hsl(var(--muted))" fill="hsl(var(--muted))" name="Total (h)" />
                        <Area type="monotone" dataKey="productive" stackId="2" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" name="Produtivo (h)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Period 1 Details */}
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Badge className="bg-primary">{data1.label}</Badge>
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-success/10">
                          <p className="text-xl font-bold text-success">{data1.productiveHours}h</p>
                          <p className="text-xs text-muted-foreground">Produtivo</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-destructive/10">
                          <p className="text-xl font-bold text-destructive">{data1.unproductiveHours}h</p>
                          <p className="text-xs text-muted-foreground">Improdutivo</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <p className="text-xl font-bold">{data1.neutralHours}h</p>
                          <p className="text-xs text-muted-foreground">Neutro</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-card border">
                          <p className="text-xs text-muted-foreground">Eficiência</p>
                          <p className="text-lg font-bold">{data1.efficiencyScore}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-card border">
                          <p className="text-xs text-muted-foreground">Foco</p>
                          <p className="text-lg font-bold">{data1.focusScore}%</p>
                        </div>
                      </div>

                      {data1.topApps.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Top Aplicativos</p>
                          <div className="space-y-1">
                            {data1.topApps.map((app, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{app.name}</span>
                                <span className="font-medium">{app.hours}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Period 2 Details */}
                  <div className="rounded-xl border-2 border-secondary/30 bg-secondary/5 p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Badge variant="secondary">{data2.label}</Badge>
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-success/10">
                          <p className="text-xl font-bold text-success">{data2.productiveHours}h</p>
                          <p className="text-xs text-muted-foreground">Produtivo</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-destructive/10">
                          <p className="text-xl font-bold text-destructive">{data2.unproductiveHours}h</p>
                          <p className="text-xs text-muted-foreground">Improdutivo</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <p className="text-xl font-bold">{data2.neutralHours}h</p>
                          <p className="text-xs text-muted-foreground">Neutro</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-card border">
                          <p className="text-xs text-muted-foreground">Eficiência</p>
                          <p className="text-lg font-bold">{data2.efficiencyScore}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-card border">
                          <p className="text-xs text-muted-foreground">Foco</p>
                          <p className="text-lg font-bold">{data2.focusScore}%</p>
                        </div>
                      </div>

                      {data2.topApps.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Top Aplicativos</p>
                          <div className="space-y-1">
                            {data2.topApps.map((app, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{app.name}</span>
                                <span className="font-medium">{app.hours}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="departments" className="space-y-6 mt-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">Produtividade por Departamento - {data1.label}</h3>
                  {data1.byDepartment.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data1.byDepartment}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="department" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="productivity" fill="hsl(var(--primary))" name="Produtividade %" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="hours" stroke="hsl(var(--warning))" name="Horas" strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-muted-foreground">
                      Sem dados de departamento disponíveis
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Change Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Resumo das Mudanças</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Produtividade', val1: data1.productivityRate, val2: data2.productivityRate, unit: '%' },
                  { label: 'Horas Totais', val1: data1.totalHours, val2: data2.totalHours, unit: 'h' },
                  { label: 'Violações', val1: data1.violationsCount, val2: data2.violationsCount, unit: '', inverse: true },
                  { label: 'Teclas Digitadas', val1: data1.keystrokesCount, val2: data2.keystrokesCount, unit: '' }
                ].map((item, idx) => {
                  const diff = item.val1 - item.val2;
                  const isPositive = item.inverse ? diff < 0 : diff > 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {isPositive ? (
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      ) : diff < 0 ? (
                        <ArrowDownRight className="h-5 w-5 text-destructive" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className={`font-semibold ${isPositive ? 'text-success' : diff < 0 ? 'text-destructive' : ''}`}>
                          {diff > 0 ? '+' : ''}{typeof item.val1 === 'number' && item.val1 > 1000 ? diff.toLocaleString() : diff}{item.unit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
