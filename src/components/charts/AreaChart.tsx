import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps } from './charts.types';
export interface AreaChartProps extends ChartProps {
  dataKey: string; fillColor?: string; strokeColor?: string;
  showGrid?: boolean; showLegend?: boolean; fillOpacity?: number;
}
export const AreaChart: React.FC<AreaChartProps> = ({
  data, dataKey, xAxisKey = 'name', fillColor = '#8884d8', strokeColor = '#8884d8',
  showGrid = true, showLegend = true, fillOpacity = 0.3, width = '100%', height = 300, className,
}) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} /><YAxis /><Tooltip />{showLegend && <Legend />}
        <Area type="monotone" dataKey={dataKey} stroke={strokeColor} fill={fillColor} fillOpacity={fillOpacity} />
      </RechartsAreaChart>
    </ResponsiveContainer>
  </div>
);
export default AreaChart;
