import React from 'react';
export interface LegendItem { name: string; color: string; }
export interface ChartLegendProps { items: LegendItem[]; direction?: 'horizontal' | 'vertical'; className?: string; }
export const ChartLegend: React.FC<ChartLegendProps> = ({ items, direction = 'horizontal', className }) => (
  <div className={className} style={{ display: 'flex', flexDirection: direction === 'horizontal' ? 'row' : 'column', gap: 16, flexWrap: 'wrap' }}>
    {items.map((item, index) => (
      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 2 }} />
        <span style={{ fontSize: 12 }}>{item.name}</span>
      </div>
    ))}
  </div>
);
export default ChartLegend;
