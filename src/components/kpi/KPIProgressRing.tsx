import { memo } from 'react';
import { cn } from '@/lib/utils';

interface KPIProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  className?: string;
}

function KPIProgressRingComponent({
  value, max = 100, size = 60, strokeWidth = 6,
  color = 'hsl(var(--primary))', bgColor = 'hsl(var(--muted))',
  showValue = true, className,
}: KPIProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500 ease-out" />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold">{Math.round(progress * 100)}%</span>
        </div>
      )}
    </div>
  );
}

export const KPIProgressRing = memo(KPIProgressRingComponent);
