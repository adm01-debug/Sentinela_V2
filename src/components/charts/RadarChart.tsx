import React from 'react';
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartProps } from './charts.types';
export interface RadarChartProps extends ChartProps {
  dataKey: string; angleKey?: string; fillColor?: string; strokeColor?: string;
  showLegend?: boolean; fillOpacity?: number;
}
export const RadarChart: React.FC<RadarChartProps> = ({
  data, dataKey, angleKey = 'subject', fillColor = '#8884d8', strokeColor = '#8884d8',
  showLegend = true, fillOpacity = 0.6, width = '100%', height = 300, className,
}) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid /><PolarAngleAxis dataKey={angleKey} /><PolarRadiusAxis />
        <Radar name={dataKey} dataKey={dataKey} stroke={strokeColor} fill={fillColor} fillOpacity={fillOpacity} />
        <Tooltip />{showLegend && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  </div>
);
export default RadarChart;
