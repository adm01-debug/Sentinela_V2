import * as React from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface TreemapItem {
  id: string;
  label: string;
  value: number;
  color?: string;
  children?: TreemapItem[];
}

export interface TreemapProps {
  data: TreemapItem[];
  width?: number;
  height?: number;
  className?: string;
  onItemClick?: (item: TreemapItem) => void;
}

interface TreemapRect {
  item: TreemapItem;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Treemap({
  data,
  width = 600,
  height = 400,
  className,
  onItemClick,
}: TreemapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const rects = useMemo(() => {
    const result: TreemapRect[] = [];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Simple squarified treemap algorithm
    const layoutRow = (items: TreemapItem[], x: number, y: number, w: number, h: number) => {
      if (items.length === 0) return;
      
      const rowTotal = items.reduce((sum, item) => sum + item.value, 0);
      const isHorizontal = w >= h;
      
      let offset = 0;
      items.forEach(item => {
        const ratio = item.value / rowTotal;
        const rectW = isHorizontal ? w * ratio : w;
        const rectH = isHorizontal ? h : h * ratio;
        const rectX = isHorizontal ? x + offset : x;
        const rectY = isHorizontal ? y : y + offset;
        
        result.push({ item, x: rectX, y: rectY, width: rectW, height: rectH });
        offset += isHorizontal ? rectW : rectH;
      });
    };
    
    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value);
    
    // Simple row-based layout
    let currentY = 0;
    let remaining = [...sorted];
    
    while (remaining.length > 0) {
      const rowHeight = (height - currentY) / Math.ceil(remaining.length / 3);
      const rowItems = remaining.splice(0, Math.min(3, remaining.length));
      layoutRow(rowItems, 0, currentY, width, rowHeight);
      currentY += rowHeight;
    }
    
    return result;
  }, [data, width, height]);

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308'];

  return (
    <TooltipProvider>
      <svg className={cn('', className)} width={width} height={height}>
        {rects.map((rect, i) => {
          const isHovered = hoveredId === rect.item.id;
          return (
            <Tooltip key={rect.item.id}>
              <TooltipTrigger asChild>
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredId(rect.item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onItemClick?.(rect.item)}
                >
                  <rect
                    x={rect.x + 1}
                    y={rect.y + 1}
                    width={Math.max(rect.width - 2, 0)}
                    height={Math.max(rect.height - 2, 0)}
                    fill={rect.item.color || colors[i % colors.length]}
                    stroke={isHovered ? '#1e293b' : 'white'}
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-all"
                    rx={4}
                  />
                  {rect.width > 50 && rect.height > 30 && (
                    <text
                      x={rect.x + rect.width / 2}
                      y={rect.y + rect.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-white font-medium pointer-events-none"
                    >
                      {rect.item.label}
                    </text>
                  )}
                  {rect.width > 50 && rect.height > 50 && (
                    <text
                      x={rect.x + rect.width / 2}
                      y={rect.y + rect.height / 2 + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-white/80 pointer-events-none"
                    >
                      {rect.item.value}
                    </text>
                  )}
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{rect.item.label}</p>
                <p className="text-sm text-muted-foreground">Value: {rect.item.value}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </svg>
    </TooltipProvider>
  );
}

export default Treemap;
