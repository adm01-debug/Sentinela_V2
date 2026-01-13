import React from 'react';
import { Treemap as RechartsTreemap, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartProps } from './charts.types';
export interface TreemapProps extends ChartProps {
  dataKey?: string; aspectRatio?: number; colors?: string[];
}
const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];
const CustomContent: React.FC<any> = ({ x, y, width, height, index, name, value }) => (
  <g>
    <rect x={x} y={y} width={width} height={height} style={{ fill: COLORS[index % COLORS.length], stroke: '#fff', strokeWidth: 2 }} />
    {width > 50 && height > 30 && (
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12}>
        {name}: {value}
      </text>
    )}
  </g>
);
export const Treemap: React.FC<TreemapProps> = ({ data, dataKey = 'size', aspectRatio = 4 / 3, width = '100%', height = 300, className }) => (
  <div className={className} style={{ width, height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsTreemap data={data} dataKey={dataKey} aspectRatio={aspectRatio} stroke="#fff" fill="#8884d8" content={<CustomContent />}>
        <Tooltip />
      </RechartsTreemap>
    </ResponsiveContainer>
  </div>
);
export default Treemap;
