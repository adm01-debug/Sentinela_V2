import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/Card";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function DataCard({ title, value, description, icon, trend, className }: DataCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <CardDescription>{description}</CardDescription>}
        {trend && (
          <p className={cn("text-xs", trend.positive ? "text-green-500" : "text-red-500")}>
            {trend.positive ? "+" : ""}{trend.value}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
