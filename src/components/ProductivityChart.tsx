import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductivityChartProps {
  data: { department: string; score: number; employees: number }[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 15%)" />
        <XAxis 
          dataKey="department" 
          stroke="hsl(215, 20%, 55%)" 
          tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="hsl(215, 20%, 55%)" 
          domain={[0, 100]}
          tick={{ fill: 'hsl(215, 20%, 55%)' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(222, 47%, 8%)', 
            border: '1px solid hsl(222, 47%, 15%)',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`${value}%`, 'Produtividade']}
        />
        <Bar 
          dataKey="score" 
          fill="hsl(217, 91%, 60%)" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
