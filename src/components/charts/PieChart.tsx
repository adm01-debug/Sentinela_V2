import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps } from './charts.types';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
export interface PieChartProps extends ChartProps {
  dataKey: string; nameKey?: string; colors?: string[];
  innerRadius?: number; outerRadius?: number; showLegend?: boolean;
}
export const PieChart: React.FC<PieChartProps> = ({
  data, dataKey, nameKey = 'name', colors = COLORS,
  innerRadius = 0, outerRadius = 80, showLegend = true,
  width = '100%', height = 300, className,
}) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} fill="#8884d8" dataKey={dataKey} nameKey={nameKey} label>
          {data.map((_, index) => (<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />))}
        </Pie>
        <Tooltip />{showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  </div>
);
export default PieChart;
