import React from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartProps } from './charts.types';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
export interface FunnelChartProps extends ChartProps { dataKey?: string; nameKey?: string; colors?: string[]; }
export const FunnelChart: React.FC<FunnelChartProps> = ({ data, dataKey = 'value', nameKey = 'name', colors = COLORS, width = '100%', height = 300, className }) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsFunnelChart>
        <Tooltip />
        <Funnel dataKey={dataKey} data={data} isAnimationActive>
          {data.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
          <LabelList position="right" fill="#000" stroke="none" dataKey={nameKey} />
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  </div>
);
export default FunnelChart;
