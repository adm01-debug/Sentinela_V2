import { AlertTriangle, TrendingUp, Smartphone, Users } from "lucide-react";
import { useGeofenceDashboardStats } from "@/hooks/useGeofenceDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseBarChart, BaseLineChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/skeleton";

export function GeofenceDashboard() {
  const { data, isLoading } = useGeofenceDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Violations by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Violações por Dia (Esta Semana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BaseLineChart
              data={data?.violationsByDay || []}
              series={[{ dataKey: "count", label: "Violações", color: "hsl(var(--destructive))" }]}
              xAxisKey="date"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Top Employees Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              Top 5 Colaboradores (Mais Violações)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BaseBarChart
              data={data?.topEmployees || []}
              series={[{ dataKey: "count", label: "Violações" }]}
              xAxisKey="name"
              layout="vertical"
              height={250}
              colorByIndex
            />
          </CardContent>
        </Card>

        {/* Top Devices Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4 text-primary" />
              Top 5 Dispositivos (Mais Violações)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BaseBarChart
              data={data?.topDevices || []}
              series={[{ dataKey: "count", label: "Violações" }]}
              xAxisKey="model"
              layout="vertical"
              height={250}
              colorByIndex
            />
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Resumo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <span className="text-5xl font-bold text-primary">{data?.totalMonthly}</span>
            <span className="mt-2 text-sm text-muted-foreground">
              Violações nos últimos 30 dias
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
