import React from 'react';
import { cn } from '@/lib/utils';

interface RadialProgressItem {
  value: number;
  max: number;
  color: string;
  label: string;
}

interface RadialProgressProps {
  items: RadialProgressItem[];
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RadialProgress({ items, size = 150, strokeWidth = 10, className }: RadialProgressProps) {
  const gap = 4;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {items.map((item, index) => {
          const radius = (size - strokeWidth) / 2 - index * (strokeWidth + gap);
          const circumference = radius * 2 * Math.PI;
          const percentage = Math.min(Math.max(item.value / item.max, 0), 1);
          const offset = circumference - percentage * circumference;

          return (
            <React.Fragment key={index}>
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500 ease-out" />
            </React.Fragment>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {items.length === 1 ? (
          <>
            <span className="text-2xl font-bold">{Math.round((items[0].value / items[0].max) * 100)}%</span>
            <span className="text-xs text-muted-foreground">{items[0].label}</span>
          </>
        ) : (
          <div className="space-y-0.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{Math.round((item.value / item.max) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
