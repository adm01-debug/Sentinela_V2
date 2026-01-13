import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps } from './charts.types';

export interface BarChartProps extends ChartProps {
  dataKey: string;
  fillColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  barSize?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data, dataKey, xAxisKey = 'name', fillColor = '#8884d8',
  showGrid = true, showLegend = true, barSize = 20,
  width = '100%', height = 300, className,
}) => {
  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} /><YAxis /><Tooltip />
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} fill={fillColor} barSize={barSize} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default BarChart;
