import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PeriodComparisonProps {
  currentPeriod: string;
  comparisonPeriod?: string;
  onComparisonChange: (period: string | null) => void;
  periods?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultPeriods = [
  { value: "previous_period", label: "Período anterior" },
  { value: "same_period_last_year", label: "Mesmo período ano anterior" },
  { value: "last_7_days", label: "Últimos 7 dias" },
  { value: "last_30_days", label: "Últimos 30 dias" },
];

function PeriodComparisonComponent({
  comparisonPeriod,
  onComparisonChange,
  periods = defaultPeriods,
  className,
}: PeriodComparisonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {comparisonPeriod
            ? `Comparando: ${periods.find((p) => p.value === comparisonPeriod)?.label}`
            : "Comparar período"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {comparisonPeriod && (
          <DropdownMenuItem onClick={() => onComparisonChange(null)}>
            Remover comparação
          </DropdownMenuItem>
        )}
        {periods.map((period) => (
          <DropdownMenuItem key={period.value} onClick={() => onComparisonChange(period.value)}>
            {period.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const PeriodComparison = memo(PeriodComparisonComponent);
