import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChartColors } from '@/hooks/useChartColors';

interface Props { data: Array<{ app: string; duration: number; percentage: number }>; }

export const ApplicationBreakdown = ({ data }: Props) => {
  const c = useChartColors();
  const palette = [c.primary, c.success, c.warning, c.destructive, c.accent, c.info, c.muted, c.foreground];

  return (
    <Card>
      <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="percentage" nameKey="app" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => value + '%'} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
