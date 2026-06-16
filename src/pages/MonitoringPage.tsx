import { useMemo } from "react";
import {
  Search,
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  Users,
  Grid,
  List,
  Keyboard,
  MousePointer2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMonitoringPage } from "@/hooks/useMonitoringPage";
import { useChartColors } from "@/hooks/useChartColors";

const statusColors: Record<string, string> = {
  online: "bg-success",
  idle: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-muted-foreground/50",
};

const statusLabels: Record<string, string> = {
  online: "Online",
  idle: "Ocioso",
  busy: "Ocupado",
  offline: "Offline",
};

export default function MonitoringPage() {
  const {
    selectedEmployee,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    employees,
    departments,
    activitySummary,
    stats,
    isLoadingEmployees,
    handleSelectEmployee,
  } = useMonitoringPage();
  const colors = useChartColors();

  // Status distribution pie
  const statusPieData = useMemo(
    () =>
      [
        { name: "Online", value: stats.online, color: colors.success },
        { name: "Ocioso", value: stats.idle, color: colors.warning },
        { name: "Ocupado", value: stats.busy, color: colors.destructive },
        { name: "Offline", value: stats.offline, color: colors.muted },
      ].filter((d) => d.value > 0),
    [stats, colors]
  );

  // Productivity by department
  const deptProductivity = useMemo(() => {
    const deptMap: Record<string, { total: number; count: number }> = {};
    employees.forEach((emp) => {
      const dept = emp.department || "Outros";
      if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
      deptMap[dept].total += emp.productivity_score;
      deptMap[dept].count++;
    });
    return Object.entries(deptMap)
      .map(([name, { total, count }]) => ({ name, produtividade: Math.round(total / count) }))
      .sort((a, b) => b.produtividade - a.produtividade)
      .slice(0, 8);
  }, [employees]);

  if (isLoadingEmployees) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoramento em Tempo Real"
        description="Acompanhe a atividade dos funcionários e status de produtividade ao vivo."
        showBackButton={false}
        actions={
          <div className="flex items-center gap-3">
            <div className="mr-2 flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} className="scale-90" />
              <span className="whitespace-nowrap text-xs text-muted-foreground">Auto-refresh</span>
            </div>
            <div className="flex gap-1 rounded-md bg-muted/50 p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("list")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Wifi className="mx-auto h-5 w-5 text-success" />
            <p className="mt-1 text-2xl font-bold">{stats.online}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-warning" />
            <p className="mt-1 text-2xl font-bold">{stats.idle}</p>
            <p className="text-xs text-muted-foreground">Ociosos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Monitor className="mx-auto h-5 w-5 text-destructive" />
            <p className="mt-1 text-2xl font-bold">{stats.busy}</p>
            <p className="text-xs text-muted-foreground">Ocupados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <WifiOff className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 text-2xl font-bold">{stats.offline}</p>
            <p className="text-xs text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex justify-center gap-3">
              {statusPieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtividade por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deptProductivity}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: colors.muted, fontSize: 10 }}
                    stroke={colors.border}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: colors.muted, fontSize: 11 }}
                    stroke={colors.border}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="produtividade"
                    name="Produtividade %"
                    fill={colors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar funcionário..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="idle">Ocioso</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(departments as string[]).map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid/List */}
      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={Users}
              title="Nenhum funcionário encontrado"
              description="Adicione funcionários para começar a monitorar suas atividades em tempo real."
            />
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <Card
              key={emp.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleSelectEmployee(emp)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColors[emp.status]}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">{emp.department}</p>
                  </div>
                  <Badge variant="outline">{statusLabels[emp.status]}</Badge>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Produtividade</span>
                    <span className="font-medium">{emp.productivity_score}%</span>
                  </div>
                  <Progress value={emp.productivity_score} className="h-2" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Última atividade:{" "}
                  {formatDistanceToNow(new Date(emp.last_activity), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-accent/50"
                role="button"
                tabIndex={0}
                onClick={() => handleSelectEmployee(emp)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectEmployee(emp);
                  }
                }}
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColors[emp.status]}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">{emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{emp.department}</span>
                  <Badge variant="outline">{statusLabels[emp.status]}</Badge>
                  <span className="text-sm font-medium">{emp.productivity_score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Employee Detail Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={() => handleSelectEmployee(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedEmployee?.name}</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">
                    {selectedEmployee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedEmployee.name}</p>
                  <p className="text-muted-foreground">{selectedEmployee.email}</p>
                  <Badge className="mt-1" variant="outline">
                    {statusLabels[selectedEmployee.status]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Keyboard className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 text-xl font-bold">
                      {activitySummary?.total_keystrokes || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Teclas hoje</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <MousePointer2 className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 text-xl font-bold">{activitySummary?.total_clicks || 0}</p>
                    <p className="text-xs text-muted-foreground">Cliques hoje</p>
                  </CardContent>
                </Card>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Tempo Ativo vs Ocioso</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ativo</span>
                    <span>{Math.round((activitySummary?.total_active_time || 0) / 60)}min</span>
                  </div>
                  <Progress
                    value={
                      activitySummary
                        ? (activitySummary.total_active_time /
                            (activitySummary.total_active_time + activitySummary.total_idle_time ||
                              1)) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Ocioso</span>
                    <span>{Math.round((activitySummary?.total_idle_time || 0) / 60)}min</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { MonitoringPage };
