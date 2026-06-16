import { BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ChartEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  height?: number;
}

export function ChartEmptyState({
  icon: Icon = BarChart3,
  title = "Sem dados disponíveis",
  description = "Os dados aparecerão quando houver informações para exibir",
  height = 250,
}: ChartEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-muted-foreground"
      style={{ height }}
    >
      <Icon className="mb-3 h-10 w-10 opacity-30" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs">{description}</p>
    </div>
  );
}
