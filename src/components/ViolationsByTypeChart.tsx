import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SecurityViolation } from '@/hooks/useSecurityViolations';
import { useMemo, useState } from 'react';
import { useChartColors } from '@/hooks/useChartColors';
import { ViolationsDrilldownDialog } from './ViolationsDrilldownDialog';

interface ViolationsByTypeChartProps {
  violations: SecurityViolation[];
  /** Callback opcional acionado ao clicar em um segmento (drill-down externo). */
  onTypeSelect?: (type: string) => void;
  /** Desativa o diálogo interno de drill-down (use quando controlar externamente). */
  disableInternalDrilldown?: boolean;
}

export function ViolationsByTypeChart({
  violations,
  onTypeSelect,
  disableInternalDrilldown = false,
}: ViolationsByTypeChartProps) {
  const c = useChartColors();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const palette = useMemo(
    () => [c.destructive, c.warning, c.info, c.success, c.accent, c.primary],
    [c],
  );

  const data = useMemo(() => {
    const typeCounts = violations.reduce((acc, v) => {
      acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [violations]);

  const handleSliceClick = (payload: { name?: string } | undefined) => {
    const type = payload?.name;
    if (!type) return;
    onTypeSelect?.(type);
    if (!disableInternalDrilldown) {
      setSelectedType(type);
      setOpen(true);
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Nenhuma violação registrada
      </div>
    );
  }

  return (
    <>
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
            onClick={handleSliceClick}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={palette[index % palette.length]}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes de ${entry.name}`}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {!disableInternalDrilldown && (
        <ViolationsDrilldownDialog
          open={open}
          onOpenChange={setOpen}
          violationType={selectedType}
          violations={violations}
        />
      )}
    </>
  );
}
