import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/hooks/useChartColors";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color,
  height = 40,
  width = 120,
  strokeWidth = 2,
}: SparklineProps) {
  const colors = useChartColors();
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color || colors.primary}
            strokeWidth={strokeWidth}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
