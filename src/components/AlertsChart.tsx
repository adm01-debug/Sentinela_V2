import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AlertsChartProps {
  data: { type: string; count: number }[];
}

const COLORS = ['hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(262, 83%, 58%)'];

export function AlertsChart({ data }: AlertsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 15%)" />
        <XAxis type="number" stroke="hsl(215, 20%, 55%)" />
        <YAxis 
          type="category" 
          dataKey="type" 
          stroke="hsl(215, 20%, 55%)" 
          tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
          width={95}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(222, 47%, 8%)', 
            border: '1px solid hsl(222, 47%, 15%)',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
