import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { ChartProps } from './charts.types';
export interface ScatterChartProps extends ChartProps {
  xDataKey: string; yDataKey: string; zDataKey?: string;
  fillColor?: string; showGrid?: boolean; showLegend?: boolean;
}
export const ScatterChart: React.FC<ScatterChartProps> = ({
  data, xDataKey, yDataKey, zDataKey, fillColor = '#8884d8',
  showGrid = true, showLegend = true, width = '100%', height = 300, className,
}) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid />}
        <XAxis type="number" dataKey={xDataKey} name={xDataKey} />
        <YAxis type="number" dataKey={yDataKey} name={yDataKey} />
        {zDataKey && <ZAxis type="number" dataKey={zDataKey} range={[60, 400]} name={zDataKey} />}
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {showLegend && <Legend />}
        <Scatter name="Data" data={data} fill={fillColor} />
      </RechartsScatterChart>
    </ResponsiveContainer>
  </div>
);
export default ScatterChart;
