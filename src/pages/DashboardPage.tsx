import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, Activity, TrendingUp, AlertTriangle, Shield, Clock,
  Filter, X, ArrowRight, Eye, Monitor, Globe, CheckCircle,
  Bell, ShieldOff, Inbox
} from 'lucide-react';
import { useDashboardStats, useRecentAlerts, useRecentActivity } from '@/hooks/useDashboard';
import { EmptyState } from '@/components/EmptyState';
import { useChartColors } from '@/hooks/useChartColors';
import { StatCard } from '@/components/StatCard';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

type Period = 'day' | 'week' | 'month';

// ============================================================
// FALLBACK DATA (shown when real data is empty)
// ============================================================

const fallbackActivityData = [
  { time: '06:00', ativos: 5, inativos: 123 },
  { time: '08:00', ativos: 42, inativos: 86 },
  { time: '09:00', ativos: 98, inativos: 30 },
  { time: '10:00', ativos: 112, inativos: 16 },
  { time: '11:00', ativos: 105, inativos: 23 },
  { time: '12:00', ativos: 65, inativos: 63 },
  { time: '13:00', ativos: 88, inativos: 40 },
  { time: '14:00', ativos: 110, inativos: 18 },
  { time: '15:00', ativos: 115, inativos: 13 },
  { time: '16:00', ativos: 95, inativos: 33 },
  { time: '17:00', ativos: 55, inativos: 73 },
  { time: '18:00', ativos: 12, inativos: 116 },
];

const fallbackProductivityData = [
  { day: 'Seg', horas: 7.5 },
  { day: 'Ter', horas: 8.2 },
  { day: 'Qua', horas: 7.8 },
  { day: 'Qui', horas: 8.5 },
  { day: 'Sex', horas: 7.1 },
];

// departmentData moved inside component to use computed colors

const fallbackAlerts = [
  { id: '1', message: 'Acesso não autorizado detectado', severity: 'critical' as const, time: '2 min atrás', employee: 'Carlos Silva' },
  { id: '2', message: 'Tentativa de exportação em massa', severity: 'high' as const, time: '15 min atrás', employee: 'Ana Costa' },
  { id: '3', message: 'Login fora do horário padrão', severity: 'medium' as const, time: '1h atrás', employee: 'Pedro Santos' },
  { id: '4', message: 'Novo dispositivo conectado', severity: 'low' as const, time: '2h atrás', employee: 'Maria Oliveira' },
];

const fallbackActivities = [
  { id: '1', user: 'Ana Costa', action: 'iniciou sessão', time: '2 min atrás', icon: Monitor },
  { id: '2', user: 'Carlos Silva', action: 'acessou relatórios', time: '5 min atrás', icon: Eye },
  { id: '3', user: 'Pedro Santos', action: 'finalizou tarefa', time: '12 min atrás', icon: CheckCircle },
  { id: '4', user: 'Maria Oliveira', action: 'atualizou perfil', time: '20 min atrás', icon: Users },
  { id: '5', user: 'João Lima', action: 'navegou site externo', time: '25 min atrás', icon: Globe },
];

const severityStyles: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-info/10 text-info border-info/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const severityLabels: Record<string, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

// ============================================================
// CUSTOM TOOLTIP
// ============================================================

interface TooltipPayloadEntry { color: string; name: string; value: string | number; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-medium text-popover-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// ============================================================
// DASHBOARD PAGE
// ============================================================

export const DashboardPage = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: realAlerts } = useRecentAlerts();
  const { data: realActivity } = useRecentActivity();
  const navigate = useNavigate();
  const colors = useChartColors();
  const { t } = useTranslation();

  const departmentData = [
    { name: 'Engenharia', value: 35, color: colors.primary },
    { name: 'Marketing', value: 22, color: colors.accent },
    { name: 'Vendas', value: 28, color: colors.success },
    { name: 'RH', value: 15, color: colors.info },
    { name: 'Financeiro', value: 18, color: colors.warning },
    { name: 'Suporte', value: 10, color: colors.destructive },
  ];

  // Use real data when available, fallback for demo
  const alerts = realAlerts && realAlerts.length > 0 ? realAlerts : fallbackAlerts;
  const activities = realActivity && realActivity.length > 0 ? realActivity : fallbackActivities;

  if (statsLoading) return <DashboardSkeleton />;

  const totalEmployees = stats?.totalEmployees || 128;
  const activeEmployees = stats?.activeEmployees || 45;
  const productivity = stats?.averageProductivity || 87;
  const alertsCount = stats?.alertsCount || 3;

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.subtitle')} — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['day', 'week', 'month'] as Period[]).map(p => (
              <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
                {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-1" />
            Filtros
            {departmentFilter !== 'all' && <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">1</Badge>}
          </Button>
          <DashboardCustomizer />
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Departamento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os departamentos</SelectItem>
              <SelectItem value="engineering">Engenharia</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Vendas</SelectItem>
              <SelectItem value="hr">RH</SelectItem>
            </SelectContent>
          </Select>
          {departmentFilter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setDepartmentFilter('all')}>
              <X className="h-4 w-4 mr-1" />Limpar
            </Button>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalEmployees')}
          value={totalEmployees}
          icon={Users}
          iconColor="bg-primary/10 text-primary"
          trend={{ value: 5.2, label: 'desde o mês passado' }}
          accentColor="primary"
        />
        <StatCard
          title={t('dashboard.activeNow')}
          value={activeEmployees}
          icon={Activity}
          iconColor="bg-success/10 text-success"
          trend={{ value: 12, label: 'desde ontem' }}
          accentColor="success"
          pulse
        />
        <StatCard
          title={t('dashboard.productivity')}
          value={productivity + '%'}
          icon={TrendingUp}
          iconColor="bg-warning/10 text-warning"
          trend={{ value: 3.8, label: 'esta semana' }}
          accentColor="warning"
        />
        <StatCard
          title={t('dashboard.alerts')}
          value={alertsCount}
          icon={AlertTriangle}
          iconColor="bg-destructive/10 text-destructive"
          trend={{ value: -25, label: 'vs semana passada', isPositive: true }}
          accentColor="destructive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Activity Over Time */}
        <Card className="lg:col-span-4 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Atividade ao Longo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fallbackActivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtivos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInativos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.muted} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={colors.muted} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="time" tick={{ fill: colors.muted, fontSize: 12 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 12 }} stroke={colors.border} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="inativos"
                    name="Inativos"
                    stroke={colors.muted}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    fill="url(#colorInativos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ativos"
                    name="Ativos"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill="url(#colorAtivos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* sr-only accessible table */}
              <table className="sr-only" aria-label="Dados de atividade ao longo do dia">
                <thead><tr><th>Horário</th><th>Ativos</th><th>Inativos</th></tr></thead>
                <tbody>
                  {fallbackActivityData.map(d => (
                    <tr key={d.time}><td>{d.time}</td><td>{d.ativos}</td><td>{d.inativos}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Bar Chart */}
        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Horas Médias por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fallbackProductivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBars" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.accent} stopOpacity={1} />
                      <stop offset="100%" stopColor={colors.accent} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="day" tick={{ fill: colors.muted, fontSize: 12 }} stroke={colors.border} />
                  <YAxis domain={[0, 10]} tick={{ fill: colors.muted, fontSize: 12 }} stroke={colors.border} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="horas" name="Horas" fill="url(#colorBars)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* sr-only accessible table */}
              <table className="sr-only" aria-label="Horas médias por dia da semana">
                <thead><tr><th>Dia</th><th>Horas</th></tr></thead>
                <tbody>
                  {fallbackProductivityData.map(d => (
                    <tr key={d.day}><td>{d.day}</td><td>{d.horas}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        {/* Alerts */}
        <Card className="lg:col-span-5 card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                Alertas Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')} className="text-xs gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              {alerts.length === 0 ? (
                <EmptyState
                  icon={ShieldOff}
                  title="Nenhum alerta recente"
                  description="Tudo tranquilo! Sem violações de segurança detectadas."
                  className="py-10"
                />
              ) : (
                <div className="space-y-2.5">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer ${severityStyles[alert.severity]}`}
                      onClick={() => navigate(`/alerts/${alert.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/alerts/${alert.id}`)}
                    >
                      <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{alert.message}</p>
                        <p className="text-xs opacity-70 mt-0.5">{alert.employee} · {alert.time}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                        {severityLabels[alert.severity]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Atividade Recente
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/activities')} className="text-xs gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              {activities.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Sem atividade recente"
                  description="As atividades dos funcionários aparecerão aqui em tempo real."
                  className="py-10"
                />
              ) : (
                <div className="space-y-1">
                  {activities.map((item) => {
                    const initials = item.user.split(' ').map(n => n[0]).join('').slice(0, 2);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
                          <span className="text-[11px] font-semibold text-primary">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-card-foreground">
                            <span className="font-medium">{item.user}</span>{' '}
                            <span className="text-muted-foreground">{item.action}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-info" />
              Por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Center total label */}
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-card-foreground text-xl font-bold">
                    {departmentData.reduce((sum, d) => sum + d.value, 0)}
                  </text>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px]">
                    total
                  </text>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                  <span className="text-muted-foreground truncate">{dept.name}</span>
                  <span className="font-medium text-card-foreground ml-auto">{dept.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
};

// ============================================================
// SKELETON
// ============================================================

const DashboardSkeleton = () => (
  <div className="space-y-6 page-enter">
    <div className="space-y-2">
      <Skeleton width={200} height={32} />
      <Skeleton width={320} height={16} />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={14} />
            <Skeleton width={36} height={36} className="rounded-lg" />
          </div>
          <Skeleton width={80} height={28} />
          <Skeleton width={140} height={12} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      <Skeleton height={340} className="lg:col-span-4 rounded-xl" />
      <Skeleton height={340} className="lg:col-span-3 rounded-xl" />
    </div>
  </div>
);

export default DashboardPage;
