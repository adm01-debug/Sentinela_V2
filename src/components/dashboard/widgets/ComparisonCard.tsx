import { memo } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface ComparisonCardProps {
  title: string;
  items: Array<{ label: string; value: number; color?: string }>;
  total?: number;
  showPercentages?: boolean;
  className?: string;
}

function ComparisonCardComponent({ title, items, total, showPercentages = true, className }: ComparisonCardProps) {
  const calculatedTotal = total || items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className={cn('bg-card border rounded-xl p-4', className)}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = (item.value / calculatedTotal) * 100;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium">
                  {item.value.toLocaleString('pt-BR')}
                  {showPercentages && <span className="text-muted-foreground ml-1">({percentage.toFixed(1)}%)</span>}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5, delay: index * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: item.color || `hsl(var(--primary))` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ComparisonCard = memo(ComparisonCardComponent);
