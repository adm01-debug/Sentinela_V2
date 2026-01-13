import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
export interface SparklineProps { data: number[]; color?: string; width?: number; height?: number; className?: string; }
export const Sparkline: React.FC<SparklineProps> = ({ data, color = '#8884d8', width = 100, height = 30, className }) => {
  const chartData = data.map((value, index) => ({ index, value }));
  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default Sparkline;
