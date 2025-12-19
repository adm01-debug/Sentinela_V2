import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRateLimitLogs, useRateLimitStats } from "@/hooks/useRateLimitLogs";
import { Shield, AlertTriangle, Activity, Users, Clock, TrendingUp, Settings, Ban } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RateLimitSettingsPanel } from "@/components/RateLimitSettingsPanel";
import { BlockedIPsPanel } from "@/components/BlockedIPsPanel";
import { RateLimitTrendsCharts } from "@/components/RateLimitTrendsCharts";

const RateLimitDashboard = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const { data: logs, isLoading: logsLoading } = useRateLimitLogs(timeRange);
  const { stats, isLoading: statsLoading } = useRateLimitStats(timeRange);

  const isLoading = logsLoading || statsLoading;

  useEffect(() => {
    document.title = "Rate Limiting Dashboard | Sistema de Monitoramento";
  }, []);

  const getEndpointColor = (endpoint: string) => {
    const colors: Record<string, string> = {
      'agent-collector': 'hsl(var(--chart-1))',
      'mobile-collector': 'hsl(var(--chart-2))',
      'analyze-activity': 'hsl(var(--chart-3))',
      'check-geofence': 'hsl(var(--chart-4))',
    };
    return colors[endpoint] || 'hsl(var(--chart-5))';
  };

  const getSeverityBadge = (requestCount: number) => {
    if (requestCount > 100) return <Badge variant="destructive">Crítico</Badge>;
    if (requestCount > 50) return <Badge className="bg-orange-500">Alto</Badge>;
    if (requestCount > 20) return <Badge className="bg-yellow-500">Médio</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rate Limiting Dashboard</h1>
            <p className="text-muted-foreground">
              Monitoramento de tentativas de acesso e proteção contra ataques
            </p>
          </div>
          <Select value={timeRange} onValueChange={(v: '1h' | '24h' | '7d') => setTimeRange(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalRequests.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Requisições monitoradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tentativas Suspeitas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {isLoading ? "..." : stats.blockedRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                Potenciais ataques detectados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IPs/Dispositivos Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.uniqueIdentifiers}
              </div>
              <p className="text-xs text-muted-foreground">
                Origens distintas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Protegido</div>
              <p className="text-xs text-muted-foreground">
                Rate limiting ativo
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="endpoints">Por Endpoint</TabsTrigger>
            <TabsTrigger value="identifiers">Por Origem</TabsTrigger>
            <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
            <TabsTrigger value="blocked" className="gap-2">
              <Ban className="h-4 w-4" />
              IPs Bloqueados
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Requests over time */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Requisições ao Longo do Tempo
                  </CardTitle>
                  <CardDescription>Volume de requisições monitoradas por hora</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {stats.requestsByHour.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.requestsByHour}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="hour" 
                            tickFormatter={(value) => format(new Date(value), 'HH:mm', { locale: ptBR })}
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
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary) / 0.2)" 
                            name="Requisições"
                          />
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
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <RateLimitTrendsCharts 
              logs={logs || []} 
              stats={stats} 
              timeRange={timeRange} 
            />
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Requisições por Endpoint</CardTitle>
                <CardDescription>Distribuição de requisições entre os endpoints protegidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {stats.topEndpoints.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topEndpoints} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-muted-foreground" />
                        <YAxis dataKey="endpoint" type="category" width={150} className="text-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                        <Bar dataKey="count" name="Requisições">
                          {stats.topEndpoints.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getEndpointColor(entry.endpoint)} />
                          ))}
                        </Bar>
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
          </TabsContent>

          <TabsContent value="identifiers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Origens por Volume</CardTitle>
                <CardDescription>IPs e dispositivos com maior número de requisições</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identificador</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Requisições</TableHead>
                      <TableHead>Severidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topIdentifiers.length > 0 ? (
                      stats.topIdentifiers.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {item.identifier.length > 30 
                              ? `${item.identifier.slice(0, 30)}...` 
                              : item.identifier}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.identifier_type}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.count.toLocaleString()}
                          </TableCell>
                          <TableCell>{getSeverityBadge(item.count)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum dado disponível
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Logs Recentes
                </CardTitle>
                <CardDescription>Últimas requisições registradas pelo sistema de rate limiting</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Contagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs && logs.length > 0 ? (
                      logs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              style={{ borderColor: getEndpointColor(log.endpoint) }}
                            >
                              {log.endpoint}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.identifier.length > 25 
                              ? `${log.identifier.slice(0, 25)}...` 
                              : log.identifier}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.identifier_type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {getSeverityBadge(log.request_count || 1)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          {isLoading ? "Carregando..." : "Nenhum log encontrado"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked" className="space-y-4">
            <BlockedIPsPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <RateLimitSettingsPanel />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default RateLimitDashboard;
