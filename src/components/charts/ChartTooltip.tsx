interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    dataKey?: string;
    payload?: unknown;
  }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number) => string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[140px] rounded-lg border border-border/60 bg-popover/95 p-3 shadow-lg shadow-black/10 backdrop-blur-lg duration-150 animate-in fade-in-0 zoom-in-95">
      {label && (
        <p className="mb-1.5 border-b border-border/40 pb-1.5 text-xs font-semibold text-popover-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold tabular-nums text-popover-foreground">
              {valueFormatter
                ? valueFormatter(Number(entry.value))
                : entry.value?.toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
