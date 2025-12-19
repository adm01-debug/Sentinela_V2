import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Legend 
} from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Clock } from "lucide-react";
import { RateLimitLog, RateLimitStats } from "@/hooks/useRateLimitLogs";

interface RateLimitTrendsChartsProps {
  logs: RateLimitLog[];
  stats: RateLimitStats;
  timeRange: '1h' | '24h' | '7d';
}

const ENDPOINT_COLORS: Record<string, string> = {
  'agent-collector': 'hsl(var(--chart-1))',
  'mobile-collector': 'hsl(var(--chart-2))',
  'analyze-activity': 'hsl(var(--chart-3))',
  'check-geofence': 'hsl(var(--chart-4))',
};

const SEVERITY_COLORS = {
  normal: 'hsl(var(--chart-2))',
  medium: 'hsl(45, 93%, 47%)',
  high: 'hsl(24, 100%, 50%)',
  critical: 'hsl(var(--destructive))',
};

export const RateLimitTrendsCharts = ({ logs, stats, timeRange }: RateLimitTrendsChartsProps) => {
  // Calculate endpoint trends over time
  const getEndpointTrends = () => {
    const timeGroups: Record<string, Record<string, number>> = {};
    
    logs.forEach(log => {
      let timeKey: string;
      if (timeRange === '1h') {
        // Group by 5 minutes
        const date = new Date(log.created_at);
        const minutes = Math.floor(date.getMinutes() / 5) * 5;
        date.setMinutes(minutes, 0, 0);
        timeKey = date.toISOString();
      } else if (timeRange === '24h') {
        // Group by hour
        timeKey = new Date(log.created_at).toISOString().slice(0, 13) + ':00';
      } else {
        // Group by day
        timeKey = startOfDay(new Date(log.created_at)).toISOString();
      }
      
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {};
      }
      timeGroups[timeKey][log.endpoint] = (timeGroups[timeKey][log.endpoint] || 0) + (log.request_count || 1);
    });

    return Object.entries(timeGroups)
      .map(([time, endpoints]) => ({
        time,
        ...endpoints,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Calculate severity distribution
  const getSeverityDistribution = () => {
    let normal = 0, medium = 0, high = 0, critical = 0;
    
    logs.forEach(log => {
      const count = log.request_count || 1;
      if (count > 100) critical++;
      else if (count > 50) high++;
      else if (count > 20) medium++;
      else normal++;
    });

    return [
      { name: 'Normal', value: normal, color: SEVERITY_COLORS.normal },
      { name: 'Médio', value: medium, color: SEVERITY_COLORS.medium },
      { name: 'Alto', value: high, color: SEVERITY_COLORS.high },
      { name: 'Crítico', value: critical, color: SEVERITY_COLORS.critical },
    ].filter(item => item.value > 0);
  };

  // Calculate peak hours
  const getPeakHours = () => {
    const hourCounts: Record<number, number> = {};
    
    logs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + (log.request_count || 1);
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: hourCounts[i] || 0,
    }));
  };

  // Calculate daily comparison (for 7d range)
  const getDailyComparison = () => {
    if (timeRange !== '7d') return [];
    
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const dayCounts: Record<string, { total: number; suspicious: number }> = {};
    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      dayCounts[key] = { total: 0, suspicious: 0 };
    });

    logs.forEach(log => {
      const dayKey = format(new Date(log.created_at), 'yyyy-MM-dd');
      if (dayCounts[dayKey]) {
        dayCounts[dayKey].total += log.request_count || 1;
        if ((log.request_count || 1) > 50) {
          dayCounts[dayKey].suspicious += 1;
        }
      }
    });

    return Object.entries(dayCounts).map(([date, counts]) => ({
      date,
      day: format(parseISO(date), 'EEE', { locale: ptBR }),
      total: counts.total,
      suspicious: counts.suspicious,
    }));
  };

  const endpointTrends = getEndpointTrends();
  const severityDistribution = getSeverityDistribution();
  const peakHours = getPeakHours();
  const dailyComparison = getDailyComparison();
  const endpoints = [...new Set(logs.map(l => l.endpoint))];

  const formatTimeAxis = (value: string) => {
    if (timeRange === '1h') {
      return format(new Date(value), 'HH:mm', { locale: ptBR });
    } else if (timeRange === '24h') {
      return format(new Date(value), 'HH:mm', { locale: ptBR });
    } else {
      return format(new Date(value), 'dd/MM', { locale: ptBR });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Endpoint Trends Over Time */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendência por Endpoint
          </CardTitle>
          <CardDescription>Comparação de requisições entre endpoints ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {endpointTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={endpointTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTimeAxis}
                    className="text-muted-foreground"
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), "dd/MM HH:mm", { locale: ptBR })}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  {endpoints.map((endpoint) => (
                    <Area 
                      key={endpoint}
                      type="monotone" 
                      dataKey={endpoint} 
                      stroke={ENDPOINT_COLORS[endpoint] || 'hsl(var(--chart-5))'} 
                      fill={`${ENDPOINT_COLORS[endpoint] || 'hsl(var(--chart-5))'}`}
                      fillOpacity={0.3}
                      name={endpoint}
                      stackId="1"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribuição de Severidade
          </CardTitle>
          <CardDescription>Classificação das requisições por nível de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {severityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {severityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários de Pico
          </CardTitle>
          <CardDescription>Distribuição de requisições por hora do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {peakHours.some(h => h.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                    interval={2}
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar dataKey="count" name="Requisições" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Comparison (7d only) */}
      {timeRange === '7d' && (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparação Diária
            </CardTitle>
            <CardDescription>Total de requisições e atividades suspeitas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailyComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-muted-foreground"
                    />
                    <YAxis yAxisId="left" className="text-muted-foreground" />
                    <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" />
                    <Tooltip 
                      labelFormatter={(_, payload) => {
                        if (payload && payload[0]) {
                          return format(parseISO(payload[0].payload.date), 'EEEE, dd/MM', { locale: ptBR });
                        }
                        return '';
                      }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Total Requisições"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="suspicious" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      name="Atividades Suspeitas"
                      dot={{ fill: 'hsl(var(--destructive))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
