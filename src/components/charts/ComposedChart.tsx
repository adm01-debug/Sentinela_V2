import React from 'react';
import { ComposedChart as RechartsComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps } from './charts.types';
export interface ComposedChartProps extends ChartProps {
  lineDataKey?: string; barDataKey?: string; areaDataKey?: string;
  showGrid?: boolean; showLegend?: boolean;
}
export const ComposedChart: React.FC<ComposedChartProps> = ({
  data, xAxisKey = 'name', lineDataKey, barDataKey, areaDataKey,
  showGrid = true, showLegend = true, width = '100%', height = 300, className,
}) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid stroke="#f5f5f5" />}
        <XAxis dataKey={xAxisKey} /><YAxis /><Tooltip />{showLegend && <Legend />}
        {areaDataKey && <Area type="monotone" dataKey={areaDataKey} fill="#8884d8" stroke="#8884d8" />}
        {barDataKey && <Bar dataKey={barDataKey} barSize={20} fill="#413ea0" />}
        {lineDataKey && <Line type="monotone" dataKey={lineDataKey} stroke="#ff7300" />}
      </RechartsComposedChart>
    </ResponsiveContainer>
  </div>
);
export default ComposedChart;
