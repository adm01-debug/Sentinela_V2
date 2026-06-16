import { memo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ChartAnnotation {
  x: number | string;
  y: number;
  label: string;
  description?: string;
  type?: "point" | "range";
  endX?: number | string;
}

export interface ChartAnnotationsProps {
  annotations: ChartAnnotation[];
  className?: string;
}

function ChartAnnotationsComponent({ annotations, className }: ChartAnnotationsProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {annotations.map((annotation, index) => (
        <div
          key={`${annotation.label}-${index}`}
          className={cn(
            "pointer-events-auto absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-warning text-[10px] font-bold text-warning-foreground"
          )}
          style={{ left: `${annotation.x}%`, bottom: `${annotation.y}%` }}
          onMouseEnter={() => setActiveAnnotation(annotation.label)}
          onMouseLeave={() => setActiveAnnotation(null)}
        >
          {index + 1}
          {activeAnnotation === annotation.label && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2"
            >
              <div className="min-w-[150px] rounded-lg border bg-popover p-2 shadow-lg">
                <p className="text-sm font-medium">{annotation.label}</p>
                {annotation.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{annotation.description}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export const ChartAnnotations = memo(ChartAnnotationsComponent);
