import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SecurityViolation } from '@/hooks/useSecurityViolations';
import { useMemo } from 'react';

interface ViolationsBySeverityChartProps {
  violations: SecurityViolation[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'hsl(0, 84%, 60%)',
  high: 'hsl(25, 95%, 53%)',
  medium: 'hsl(38, 92%, 50%)',
  low: 'hsl(142, 76%, 36%)',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export function ViolationsBySeverityChart({ violations }: ViolationsBySeverityChartProps) {
  const data = useMemo(() => {
    const severityCounts = violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return SEVERITY_ORDER.map(severity => ({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count: severityCounts[severity] || 0,
      color: SEVERITY_COLORS[severity],
    }));
  }, [violations]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
        <YAxis
          type="category"
          dataKey="severity"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
