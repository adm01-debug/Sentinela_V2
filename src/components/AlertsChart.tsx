import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';

interface AlertsChartProps {
  data: { type: string; count: number }[];
}

export function AlertsChart({ data }: AlertsChartProps) {
  const c = useChartColors();
  const palette = [c.destructive, c.warning, c.info, c.success, c.accent];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
        <XAxis type="number" stroke={c.muted} />
        <YAxis
          type="category"
          dataKey="type"
          stroke={c.muted}
          tick={{ fill: c.muted, fontSize: 12 }}
          width={95}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            color: c.foreground,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
