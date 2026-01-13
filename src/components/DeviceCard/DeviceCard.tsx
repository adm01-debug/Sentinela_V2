import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface DeviceCardProps {
  name: string;
  type: "desktop" | "mobile" | "tablet";
  status: "online" | "offline" | "idle";
  lastSeen?: string;
  osInfo?: string;
}

const icons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-500",
  idle: "bg-yellow-500"
};

export function DeviceCard({ name, type, status, lastSeen, osInfo }: DeviceCardProps) {
  const Icon = icons[type];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <div className="flex-1">
          <CardTitle className="text-lg">{name}</CardTitle>
          {osInfo && <CardDescription>{osInfo}</CardDescription>}
        </div>
        <Badge className={statusColors[status]}>{status}</Badge>
      </CardHeader>
      <CardContent>
        {lastSeen && <p className="text-sm text-muted-foreground">Last seen: {lastSeen}</p>}
      </CardContent>
    </Card>
  );
}
