import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ComparisonCardProps {
  title: string;
  items: Array<{ label: string; value: number; color?: string }>;
  total?: number;
  showPercentages?: boolean;
  className?: string;
}

function ComparisonCardComponent({
  title,
  items,
  total,
  showPercentages = true,
  className,
}: ComparisonCardProps) {
  const calculatedTotal = total || items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = (item.value / calculatedTotal) * 100;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium">
                  {item.value.toLocaleString("pt-BR")}
                  {showPercentages && (
                    <span className="ml-1 text-muted-foreground">({percentage.toFixed(1)}%)</span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color || `hsl(var(--primary))` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ComparisonCard = memo(ComparisonCardComponent);
