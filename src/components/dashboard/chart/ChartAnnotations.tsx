import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ChartAnnotation {
  x: number | string;
  y: number;
  label: string;
  description?: string;
  type?: 'point' | 'range';
  endX?: number | string;
}

export interface ChartAnnotationsProps {
  annotations: ChartAnnotation[];
  className?: string;
}

function ChartAnnotationsComponent({ annotations, className }: ChartAnnotationsProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {annotations.map((annotation, index) => (
        <div
          key={`${annotation.label}-${index}`}
          className={cn('absolute pointer-events-auto cursor-pointer w-4 h-4 rounded-full bg-warning border-2 border-background flex items-center justify-center text-[10px] font-bold text-warning-foreground -translate-x-1/2 -translate-y-1/2')}
          style={{ left: `${annotation.x}%`, bottom: `${annotation.y}%` }}
          onMouseEnter={() => setActiveAnnotation(annotation.label)}
          onMouseLeave={() => setActiveAnnotation(null)}
        >
          {index + 1}
          {activeAnnotation === annotation.label && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
              <div className="bg-popover border rounded-lg shadow-lg p-2 min-w-[150px]">
                <p className="font-medium text-sm">{annotation.label}</p>
                {annotation.description && <p className="text-xs text-muted-foreground mt-1">{annotation.description}</p>}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export const ChartAnnotations = memo(ChartAnnotationsComponent);
