import { Activity, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseAreaChart, BaseBarChart, BaseDonutChart } from '@/components/charts';
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
          <BaseAreaChart
            data={fallbackActivityData}
            series={[
              { dataKey: 'ativos', label: 'Ativos', color: colors.primary },
              { dataKey: 'inativos', label: 'Inativos', color: colors.muted, dashed: true }
            ]}
            xAxisKey="time"
            height={280}
          />
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
          <BaseBarChart
            data={fallbackProductivityData}
            series={[{ dataKey: 'horas', label: 'Horas', color: colors.accent }]}
            xAxisKey="day"
            height={280}
          />
        </div>
      </CardContent>
    </Card>
  </div>
);

interface DepartmentPieChartProps {
  departmentData: { name: string; value: number; color: string }[];
}

export const DepartmentPieChart = ({ departmentData }: DepartmentPieChartProps) => {
  const total = departmentData.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <Card className="lg:col-span-3 card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-info" />
          Por Departamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[120px] sm:h-[150px] relative">
          <BaseDonutChart
            data={departmentData}
            height={150}
            innerRadius={40}
            outerRadius={65}
            colors={departmentData.map(d => d.color)}
            showLabel={false}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold">{total}</span>
            <span className="text-[10px] text-muted-foreground uppercase">total</span>
          </div>
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
};