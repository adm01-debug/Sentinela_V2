import * as React from "react";
import { Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveStatProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function LiveStatWidget({ title, value, change, icon, trend, className }: LiveStatProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          {icon || <Activity className="h-4 w-4 text-primary" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                  ? "text-red-600"
                  : "text-muted-foreground"
            )}
          >
            <TrendingUp className={cn("h-3 w-3", trend === "down" && "rotate-180")} />
            {change > 0 ? "+" : ""}
            {change}% from last period
          </p>
        )}
      </CardContent>
      <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-primary/5" />
    </Card>
  );
}
export default LiveStatWidget;
