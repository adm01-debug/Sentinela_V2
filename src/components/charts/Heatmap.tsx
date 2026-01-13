import React from 'react';
import { ChartProps } from './charts.types';
export interface HeatmapProps extends ChartProps {
  rows: string[]; cols: string[]; colorScale?: string[];
  cellSize?: number; showValues?: boolean;
}
const getColor = (value: number, min: number, max: number, colors: string[]) => {
  const ratio = (value - min) / (max - min);
  const idx = Math.min(Math.floor(ratio * colors.length), colors.length - 1);
  return colors[idx];
};
export const Heatmap: React.FC<HeatmapProps> = ({
  data, rows, cols, colorScale = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  cellSize = 40, showValues = true, className,
}) => {
  const values = data.flatMap((row: any) => Object.values(row).filter((v): v is number => typeof v === 'number'));
  const min = Math.min(...values); const max = Math.max(...values);
  return (
    <div className={className}>
      <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${cols.length}, ${cellSize}px)`, gap: 2 }}>
        <div />{cols.map((col, i) => <div key={i} style={{ fontSize: 10, textAlign: 'center' }}>{col}</div>)}
        {rows.map((row, ri) => (
          <React.Fragment key={ri}>
            <div style={{ fontSize: 10, paddingRight: 8 }}>{row}</div>
            {cols.map((col, ci) => {
              const val = data[ri]?.[col] ?? 0;
              return (
                <div key={ci} style={{ width: cellSize, height: cellSize, backgroundColor: getColor(val, min, max, colorScale), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {showValues && val}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default Heatmap;
