import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SecurityViolation } from '@/hooks/useSecurityViolations';
import { useMemo } from 'react';

interface ViolationsByTypeChartProps {
  violations: SecurityViolation[];
}

const COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(262, 83%, 58%)',
  'hsl(330, 81%, 60%)',
];

export function ViolationsByTypeChart({ violations }: ViolationsByTypeChartProps) {
  const data = useMemo(() => {
    const typeCounts = violations.reduce((acc, v) => {
      acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [violations]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Nenhuma violação registrada
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
