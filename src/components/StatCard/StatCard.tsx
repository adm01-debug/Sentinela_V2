import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/Card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, className }: StatCardProps) {
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus;
  const trendColor = change && change > 0 ? "text-green-500" : change && change < 0 ? "text-red-500" : "text-gray-500";

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm mt-1", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{change > 0 ? "+" : ""}{change}%</span>
            {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
