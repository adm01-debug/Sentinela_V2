import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';
import { SecurityViolation } from '@/hooks/useSecurityViolations';

interface ViolationsByEmployeeChartProps {
  violations: SecurityViolation[];
}

const COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(25, 95%, 53%)',
  'hsl(38, 92%, 50%)',
  'hsl(217, 91%, 60%)',
  'hsl(262, 83%, 58%)',
];

export function ViolationsByEmployeeChart({ violations }: ViolationsByEmployeeChartProps) {
  const data = useMemo(() => {
    // Use employee?.name or employee_id as fallback since SecurityViolation uses employee relation
    const employeeCounts = violations.reduce((acc, v) => {
      const name = v.employee?.name || v.employee_id || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(employeeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
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
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
        <YAxis
          type="category"
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
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
