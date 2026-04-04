import { StatsCard } from '@/components/Cards/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users, Activity, Shield, Clock, TrendingUp,
  AlertTriangle, CheckCircle, Monitor, Globe,
  ArrowRight, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const activityData = [
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

const productivityData = [
  { day: 'Seg', horas: 7.5, fill: 'hsl(262, 83%, 58%)' },
  { day: 'Ter', horas: 8.2, fill: 'hsl(262, 83%, 58%)' },
  { day: 'Qua', horas: 7.8, fill: 'hsl(262, 83%, 58%)' },
  { day: 'Qui', horas: 8.5, fill: 'hsl(262, 83%, 58%)' },
  { day: 'Sex', horas: 7.1, fill: 'hsl(0, 84%, 60%)' },
];

const departmentData = [
  { name: 'Engenharia', value: 35, color: 'hsl(243, 75%, 59%)' },
  { name: 'Marketing', value: 22, color: 'hsl(262, 83%, 58%)' },
  { name: 'Vendas', value: 28, color: 'hsl(160, 84%, 39%)' },
  { name: 'RH', value: 15, color: 'hsl(199, 89%, 48%)' },
  { name: 'Financeiro', value: 18, color: 'hsl(38, 92%, 50%)' },
  { name: 'Suporte', value: 10, color: 'hsl(0, 84%, 60%)' },
];

const recentAlerts = [
  { id: '1', message: 'Acesso não autorizado detectado', severity: 'critical' as const, time: '2 min atrás', employee: 'Carlos Silva' },
  { id: '2', message: 'Tentativa de exportação em massa', severity: 'high' as const, time: '15 min atrás', employee: 'Ana Costa' },
  { id: '3', message: 'Login fora do horário padrão', severity: 'medium' as const, time: '1h atrás', employee: 'Pedro Santos' },
  { id: '4', message: 'Novo dispositivo conectado', severity: 'low' as const, time: '2h atrás', employee: 'Maria Oliveira' },
];

const recentActivities = [
  { id: '1', user: 'Ana Costa', action: 'iniciou sessão', time: '2 min atrás', icon: Monitor },
  { id: '2', user: 'Carlos Silva', action: 'acessou relatórios', time: '5 min atrás', icon: Eye },
  { id: '3', user: 'Pedro Santos', action: 'finalizou tarefa', time: '12 min atrás', icon: CheckCircle },
  { id: '4', user: 'Maria Oliveira', action: 'atualizou perfil', time: '20 min atrás', icon: Users },
  { id: '5', user: 'João Lima', action: 'navegou site externo', time: '25 min atrás', icon: Globe },
];

const severityStyles = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-info/10 text-info border-info/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
      {payload.map((entry, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-medium text-popover-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do monitoramento — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/reports')} className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Ver Relatórios
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Funcionários"
          value="128"
          icon={Users}
          iconColor="bg-primary/10 text-primary"
          trend={{ value: 5.2, label: 'desde o mês passado' }}
          sparklineData={[{ value: 110 }, { value: 112 }, { value: 118 }, { value: 120 }, { value: 123 }, { value: 125 }, { value: 128 }]}
          sparklineColor="hsl(var(--primary))"
        />
        <StatsCard
          title="Ativos Agora"
          value="45"
          icon={Activity}
          iconColor="bg-success/10 text-success"
          trend={{ value: 12, label: 'desde ontem' }}
          sparklineData={[{ value: 30 }, { value: 35 }, { value: 28 }, { value: 42 }, { value: 38 }, { value: 40 }, { value: 45 }]}
          sparklineColor="hsl(var(--success))"
        />
        <StatsCard
          title="Alertas de Segurança"
          value="3"
          icon={Shield}
          iconColor="bg-destructive/10 text-destructive"
          trend={{ value: -25, label: 'desde a semana passada' }}
          sparklineData={[{ value: 8 }, { value: 6 }, { value: 5 }, { value: 7 }, { value: 4 }, { value: 4 }, { value: 3 }]}
          sparklineColor="hsl(var(--destructive))"
        />
        <StatsCard
          title="Horas Trabalhadas"
          value="1,234"
          icon={Clock}
          iconColor="bg-warning/10 text-warning"
          description="Esta semana"
          sparklineData={[{ value: 200 }, { value: 240 }, { value: 260 }, { value: 250 }, { value: 284 }]}
          sparklineColor="hsl(var(--warning))"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Activity Over Time - larger chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Atividade ao Longo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtivos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" tick={{ fill: 'hsl(220, 9%, 46%)' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(220, 9%, 46%)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ativos"
                    name="Ativos"
                    stroke="hsl(243, 75%, 59%)"
                    strokeWidth={2}
                    fill="url(#colorAtivos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Horas Médias por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(220, 9%, 46%)' }} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'hsl(220, 9%, 46%)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="horas" name="Horas" fill="hsl(262, 83%, 58%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        {/* Alerts */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alertas Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')} className="text-xs gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-2.5">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/30 ${severityStyles[alert.severity]}`}
                  >
                    <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{alert.message}</p>
                      <p className="text-xs opacity-70 mt-0.5">{alert.employee} · {alert.time}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{alert.severity}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4">
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
              <div className="space-y-1">
                {recentActivities.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground">
                        <span className="font-medium">{item.user}</span>{' '}
                        <span className="text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Por Departamento</CardTitle>
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
  );
}
