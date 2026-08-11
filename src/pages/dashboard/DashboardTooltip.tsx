interface TooltipPayloadEntry { color: string; name: string; value: string | number; }

export const DashboardTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover/95 backdrop-blur-lg p-3 shadow-lg shadow-black/10 min-w-[140px] animate-in fade-in-0 zoom-in-95 duration-150">
      {label && (
        <p className="text-xs font-semibold text-popover-foreground mb-1.5 pb-1.5 border-b border-border/40">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full ring-1 ring-white/10 shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.name}</span>
            </div>
            <span className="font-semibold text-popover-foreground tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
