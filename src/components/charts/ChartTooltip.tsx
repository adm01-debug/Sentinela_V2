import React from 'react';
export interface ChartTooltipProps { active?: boolean; payload?: any[]; label?: string; formatter?: (value: any, name: string) => string; className?: string; }
export const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, formatter, className }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={className} style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {label && <p style={{ margin: 0, fontWeight: 'bold', marginBottom: 5 }}>{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} style={{ margin: 0, color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
        </p>
      ))}
    </div>
  );
};
export default ChartTooltip;
