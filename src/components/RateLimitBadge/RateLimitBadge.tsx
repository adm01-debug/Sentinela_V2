import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RateLimitBadgeProps {
  used: number;
  limit: number;
  resetTime?: string;
}

export function RateLimitBadge({ used, limit, resetTime }: RateLimitBadgeProps) {
  const percentage = (used / limit) * 100;
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span>API Calls</span>
        <Badge variant={isDanger ? "destructive" : isWarning ? "secondary" : "outline"}>
          {used} / {limit}
        </Badge>
      </div>
      <Progress value={percentage} className={isDanger ? "bg-red-200" : isWarning ? "bg-yellow-200" : ""} />
      {resetTime && <span className="text-xs text-muted-foreground">Resets: {resetTime}</span>}
    </div>
  );
}
