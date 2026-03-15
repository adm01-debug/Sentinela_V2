import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApplicationAnalytics } from '@/hooks/useAnalytics';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

interface PieLabelProps {
  name: string;
  percent: number;
}

interface CategoryItem {
  name: string;
  value: number;
}

interface AppItem {
  name: string;
  category: string;
  hours: number;
  percentage: number;
}

export default function AnalyticsApplicationsPage() {
  const { data } = useApplicationAnalytics();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Uso de Aplicações</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribuição por Categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data?.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: PieLabelProps) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.byCategory?.map((_: CategoryItem, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Aplicações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {data?.topApps?.map((app: AppItem, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{app.name}</span>
                  <Badge variant={app.category === 'productive' ? 'default' : 'secondary'}>{app.category}</Badge>
                </div>
                <Progress value={app.percentage} />
                <p className="text-sm text-muted-foreground">{app.hours}h ({app.percentage}%)</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Uso por Hora do Dia</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data?.byHour}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
