import { useQuery } from "@tanstack/react-query";
import { Loader2, Activity, AlertCircle, Clock, Zap } from "lucide-react";
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
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const EdgeFunctionDashboard = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["edge-function-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edge_function_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const errorRate = logs ? (logs.filter((l) => l.status >= 400).length / logs.length) * 100 : 0;
  const avgDuration = logs
    ? logs.reduce((acc, l) => acc + (l.duration_ms || 0), 0) / logs.length
    : 0;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoramento de Edge Functions</h1>
        <p className="text-muted-foreground">Acompanhe a performance e erros em tempo real.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições (100)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latência Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration.toFixed(0)}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime Estimado</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requisições por Minuto</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logs?.slice(0, 20).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="created_at" tick={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration_ms" fill="#8884d8" name="Duração (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs?.slice(0, 20).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="created_at" tick={false} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="duration_ms" stroke="#82ca9d" name="ms" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.function_name}</TableCell>
                  <TableCell>
                    <Badge variant={log.status >= 400 ? "destructive" : "secondary"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.duration_ms}ms</TableCell>
                  <TableCell className="font-mono text-xs">{log.request_id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeFunctionDashboard;
