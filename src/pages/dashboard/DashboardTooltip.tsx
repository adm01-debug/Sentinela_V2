interface TooltipPayloadEntry {
  color: string;
  name: string;
  value: string | number;
}

export const DashboardTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[140px] rounded-lg border border-border/60 bg-popover/95 p-3 shadow-lg shadow-black/10 backdrop-blur-lg duration-150 animate-in fade-in-0 zoom-in-95">
      {label && (
        <p className="mb-1.5 border-b border-border/40 pb-1.5 text-xs font-semibold text-popover-foreground">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{entry.name}</span>
            </div>
            <span className="font-semibold tabular-nums text-popover-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
