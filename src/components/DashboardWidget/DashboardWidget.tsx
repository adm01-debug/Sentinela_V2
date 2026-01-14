import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function DashboardWidget({ title, children, className, actions }: DashboardWidgetProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {actions && <div className="flex gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
