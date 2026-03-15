import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApplicationAnalytics } from '@/hooks/useAnalytics';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--destructive))',
];

interface PieLabelRenderProps {
  category?: string;
  percent?: number;
}

interface AppCategory {
  category: string;
  count: number;
  duration: number;
}

export default function AnalyticsApplicationsPage() {
  const { data } = useApplicationAnalytics();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Uso de Aplicações</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
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
                    dataKey="count"
                    nameKey="category"
                    label={({ category, percent }: PieLabelRenderProps) => `${category ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {data?.byCategory?.map((_: AppCategory, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Aplicações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.topApps?.map((app: AppCategory, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{app.category}</span>
                  <Badge variant="default">{app.count}</Badge>
                </div>
                <Progress value={Math.min(Math.max(app.duration, 0), 100)} />
                <p className="text-sm text-muted-foreground">{app.duration}h ({app.count})</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uso por Hora do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data?.byHour}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
