import { Activity, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DashboardTooltip } from './DashboardTooltip';
import { fallbackActivityData, fallbackProductivityData } from './dashboardData';

interface ChartColors {
  primary: string;
  accent: string;
  success: string;
  info: string;
  warning: string;
  destructive: string;
  muted: string;
  border: string;
}

interface DashboardChartsRowProps {
  colors: ChartColors;
}

export const DashboardChartsRow = ({ colors }: DashboardChartsRowProps) => (
  <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
    <Card className="lg:col-span-4 card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Atividade ao Longo do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[240px] lg:h-[280px]">
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
              <Tooltip content={<DashboardTooltip />} />
              <Area type="monotone" dataKey="inativos" name="Inativos" stroke={colors.muted} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#colorInativos)" />
              <Area type="monotone" dataKey="ativos" name="Ativos" stroke={colors.primary} strokeWidth={2} fill="url(#colorAtivos)" />
            </AreaChart>
          </ResponsiveContainer>
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

    <Card className="lg:col-span-3 card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          Horas Médias por Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[240px] lg:h-[280px]">
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
              <Tooltip content={<DashboardTooltip />} />
              <Bar dataKey="horas" name="Horas" fill="url(#colorBars)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
);

interface DepartmentPieChartProps {
  departmentData: { name: string; value: number; color: string }[];
}

export const DepartmentPieChart = ({ departmentData }: DepartmentPieChartProps) => (
  <Card className="lg:col-span-3 card-hover">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <Users className="h-4 w-4 text-info" />
        Por Departamento
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[120px] sm:h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={departmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              {departmentData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-card-foreground text-xl font-bold">
              {departmentData.reduce((sum, d) => sum + d.value, 0)}
            </text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px]">
              total
            </text>
            <Tooltip content={<DashboardTooltip />} />
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
);
