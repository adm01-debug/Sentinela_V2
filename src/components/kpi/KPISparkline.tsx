import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface SparklineData {
  value: number;
  label?: string;
}

interface KPISparklineProps {
  data: SparklineData[];
  height?: number;
  color?: string;
  showArea?: boolean;
  className?: string;
}

function KPISparklineComponent({
  data, height = 40, color = 'hsl(var(--primary))', showArea = true, className,
}: KPISparklineProps) {
  const { path, areaPath } = useMemo(() => {
    if (!data || data.length < 2) return { path: '', areaPath: '', points: [] };
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 100;
    const padding = 2;
    const effectiveHeight = height - padding * 2;

    const pointsList = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padding + effectiveHeight - ((d.value - min) / range) * effectiveHeight,
    }));

    const linePath = pointsList.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${linePath} L ${width} ${height} L 0 ${height} Z`;
    return { path: linePath, areaPath: area, points: pointsList };
  }, [data, height]);

  if (!data || data.length < 2) return null;

  return (
    <svg className={cn('w-full', className)} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {showArea && <path d={areaPath} fill={`url(#sparkline-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`} opacity={0.2} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const KPISparkline = memo(KPISparklineComponent);
