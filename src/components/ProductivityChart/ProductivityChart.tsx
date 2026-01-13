import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProductivityChartProps {
  data: Array<{ date: string; productivity: number; target?: number }>;
  title?: string;
}

export function ProductivityChart({ data, title = "Productivity Over Time" }: ProductivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="productivity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            {data[0]?.target !== undefined && (
              <Area type="monotone" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} strokeDasharray="5 5" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
