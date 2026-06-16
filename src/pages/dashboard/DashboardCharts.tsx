import { memo } from "react";
import { Activity, Clock, Users } from "lucide-react";
import { fallbackActivityData, fallbackProductivityData } from "./dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseAreaChart, BaseBarChart, BaseDonutChart } from "@/components/charts";

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

export const DashboardChartsRow = memo(({ colors }: DashboardChartsRowProps) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
    <Card className="card-hover lg:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="h-4 w-4 text-primary" />
          Atividade ao Longo do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[240px] lg:h-[280px]">
          <BaseAreaChart
            data={fallbackActivityData}
            series={[
              { dataKey: "ativos", label: "Ativos", color: colors.primary },
              { dataKey: "inativos", label: "Inativos", color: colors.muted, dashed: true },
            ]}
            xAxisKey="time"
            height={280}
          />
        </div>
      </CardContent>
    </Card>

    <Card className="card-hover lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-4 w-4 text-warning" />
          Horas Médias por Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[240px] lg:h-[280px]">
          <BaseBarChart
            data={fallbackProductivityData}
            series={[{ dataKey: "horas", label: "Horas", color: colors.accent }]}
            xAxisKey="day"
            height={280}
          />
        </div>
      </CardContent>
    </Card>
  </div>
));

DashboardChartsRow.displayName = "DashboardChartsRow";

interface DepartmentPieChartProps {
  departmentData: { name: string; value: number; color: string }[];
}

export const DepartmentPieChart = memo(({ departmentData }: DepartmentPieChartProps) => {
  const total = departmentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="card-hover lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="text-info h-4 w-4" />
          Por Departamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[120px] sm:h-[150px]">
          <BaseDonutChart
            data={departmentData}
            height={150}
            innerRadius={40}
            outerRadius={65}
            colors={departmentData.map((d) => d.color)}
            showLabel={false}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{total}</span>
            <span className="text-[10px] uppercase text-muted-foreground">total</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {departmentData.map((dept) => (
            <div key={dept.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              <span className="truncate text-muted-foreground">{dept.name}</span>
              <span className="ml-auto font-medium text-card-foreground">{dept.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

DepartmentPieChart.displayName = "DepartmentPieChart";
