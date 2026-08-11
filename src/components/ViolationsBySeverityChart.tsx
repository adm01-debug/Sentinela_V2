import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SecurityViolation } from '@/hooks/useSecurityViolations';
import { useMemo, useState } from 'react';
import { useChartColors } from '@/hooks/useChartColors';
import { ViolationsDrilldownDialog } from './ViolationsDrilldownDialog';

interface ViolationsBySeverityChartProps {
  violations: SecurityViolation[];
  /** Callback opcional acionado ao clicar em uma barra (drill-down externo). */
  onSeveritySelect?: (severity: SecurityViolation['severity']) => void;
  /** Desativa o diálogo interno de drill-down (use quando controlar externamente). */
  disableInternalDrilldown?: boolean;
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;
type SeverityKey = (typeof SEVERITY_ORDER)[number];

const SEVERITY_LABELS: Record<SeverityKey, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export function ViolationsBySeverityChart({
  violations,
  onSeveritySelect,
  disableInternalDrilldown = false,
}: ViolationsBySeverityChartProps) {
  const c = useChartColors();
  const [selected, setSelected] = useState<SeverityKey | null>(null);
  const [open, setOpen] = useState(false);

  const severityColors: Record<SeverityKey, string> = useMemo(
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
      key: severity,
      severity: SEVERITY_LABELS[severity],
      count: severityCounts[severity] || 0,
      color: severityColors[severity],
    }));
  }, [violations, severityColors]);

  const handleClick = (payload: { key?: SeverityKey } | undefined) => {
    const key = payload?.key;
    if (!key) return;
    onSeveritySelect?.(key);
    if (!disableInternalDrilldown) {
      setSelected(key);
      setOpen(true);
    }
  };

  return (
    <>
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
          <Bar dataKey="count" radius={[0, 4, 4, 0]} onClick={handleClick} cursor="pointer">
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.color}
                role="button"
                tabIndex={0}
                aria-label={`Ver violações de severidade ${entry.severity}`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {!disableInternalDrilldown && (
        <ViolationsDrilldownDialog
          open={open}
          onOpenChange={setOpen}
          initialSeverity={selected}
          violations={violations}
        />
      )}
    </>
  );
}
