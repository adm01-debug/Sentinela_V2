import * as React from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({ data, width = 100, height = 30, strokeColor = '#6366f1', fillColor, strokeWidth = 2, showDots = false, className }: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * (height - 4) - 2,
    }));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [data, width, height]);

  const fillPath = useMemo(() => {
    if (!fillColor || data.length < 2) return '';
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  }, [path, fillColor, width, height, data.length]);

  const lastPoint = useMemo(() => {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return { x: width, y: height - ((data[data.length - 1] - min) / range) * (height - 4) - 2 };
  }, [data, width, height]);

  return (
    <svg className={cn('', className)} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fillPath && <path d={fillPath} fill={fillColor} opacity={0.2} />}
      <path d={path} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {showDots && lastPoint && <circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={strokeColor} />}
    </svg>
  );
}
export default Sparkline;
