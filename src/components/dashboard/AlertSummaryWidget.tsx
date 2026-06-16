import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Alert {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  acknowledged?: boolean;
}

export function AlertSummaryWidget({ alerts, className }: { alerts: Alert[]; className?: string }) {
  const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  alerts.forEach((a) => {
    if (!a.acknowledged) severityCounts[a.severity]++;
  });
  const severityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };
  const total = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alert Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-center">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              {total > 0 &&
                Object.entries(severityCounts).map(([sev, count], i) => {
                  const pct = (count / total) * 251.2;
                  const offset = Object.values(severityCounts)
                    .slice(0, i)
                    .reduce((a, b) => a + (b / total) * 251.2, 0);
                  return (
                    <circle
                      key={sev}
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={severityColors[sev as keyof typeof severityColors].replace(
                        "bg-",
                        "#"
                      )}
                      strokeWidth="8"
                      strokeDasharray={`${pct} 251.2`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{total}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(severityCounts).map(([sev, count]) => (
            <div key={sev} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  severityColors[sev as keyof typeof severityColors]
                )}
              />
              <span className="text-sm capitalize">{sev}</span>
              <span className="ml-auto font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
export default AlertSummaryWidget;
