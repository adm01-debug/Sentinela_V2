import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Activity, Clock, AlertTriangle } from "lucide-react";

interface MonitoringCardProps {
  employeeName: string;
  status: "active" | "idle" | "offline";
  currentActivity?: string;
  activeTime: string;
  idleTime: string;
  alerts?: number;
}

export function MonitoringCard({ employeeName, status, currentActivity, activeTime, idleTime, alerts = 0 }: MonitoringCardProps) {
  const statusColors = { active: "bg-green-500", idle: "bg-yellow-500", offline: "bg-gray-500" };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{employeeName}</CardTitle>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        {currentActivity && <CardDescription>{currentActivity}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-green-500" />
          <span>Active: {activeTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span>Idle: {idleTime}</span>
        </div>
        {alerts > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <span>{alerts} alerts</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
