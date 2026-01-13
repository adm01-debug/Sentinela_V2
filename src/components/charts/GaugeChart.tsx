import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
export interface GaugeChartProps { value: number; min?: number; max?: number; colors?: string[]; label?: string; width?: string | number; height?: number; className?: string; }
export const GaugeChart: React.FC<GaugeChartProps> = ({ value, min = 0, max = 100, colors = ['#ff4d4f', '#faad14', '#52c41a'], label, width = '100%', height = 200, className }) => {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const data = [{ value: pct * 180 }, { value: (1 - pct) * 180 }];
  const colorIdx = pct < 0.33 ? 0 : pct < 0.66 ? 1 : 2;
  return (
    <div className={className} style={{ width, height, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="70%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} dataKey="value">
            <Cell fill={colors[colorIdx]} /><Cell fill="#f0f0f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 'bold' }}>{value}</div>
        {label && <div style={{ fontSize: 12, color: '#666' }}>{label}</div>}
      </div>
    </div>
  );
};
export default GaugeChart;
