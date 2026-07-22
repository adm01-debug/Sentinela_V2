import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SecurityViolation } from '@/hooks/useSecurityViolations';
import { useMemo } from 'react';
import { useChartColors } from '@/hooks/useChartColors';

interface ViolationsBySeverityChartProps {
  violations: SecurityViolation[];
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;
const SEVERITY_LABELS: Record<(typeof SEVERITY_ORDER)[number], string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export function ViolationsBySeverityChart({ violations }: ViolationsBySeverityChartProps) {
  const c = useChartColors();

  const severityColors: Record<(typeof SEVERITY_ORDER)[number], string> = useMemo(
    () => ({
      critical: c.destructive,
      high: c.warning,
      medium: c.info,
      low: c.success,
    }),
    [c],
  );

  const data = useMemo(() => {
    const severityCounts = violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return SEVERITY_ORDER.map(severity => ({
      severity: SEVERITY_LABELS[severity],
      count: severityCounts[severity] || 0,
      color: severityColors[severity],
    }));
  }, [violations, severityColors]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
        <XAxis type="number" stroke={c.muted} />
        <YAxis
          type="category"
          dataKey="severity"
          stroke={c.muted}
          tick={{ fill: c.muted, fontSize: 12 }}
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
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
