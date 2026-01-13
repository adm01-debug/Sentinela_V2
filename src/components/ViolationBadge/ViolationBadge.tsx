import React from "react";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  XCircle, 
  CheckCircle,
  AlertOctagon 
} from "lucide-react";

interface ViolationBadgeProps {
  type: "critical" | "high" | "medium" | "low" | "info" | "resolved";
  label?: string;
  count?: number;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const typeConfig = {
  critical: {
    color: "bg-red-600 text-white hover:bg-red-700",
    icon: AlertOctagon,
    defaultLabel: "Critical"
  },
  high: {
    color: "bg-orange-500 text-white hover:bg-orange-600",
    icon: AlertTriangle,
    defaultLabel: "High"
  },
  medium: {
    color: "bg-yellow-500 text-black hover:bg-yellow-600",
    icon: Shield,
    defaultLabel: "Medium"
  },
  low: {
    color: "bg-blue-500 text-white hover:bg-blue-600",
    icon: Clock,
    defaultLabel: "Low"
  },
  info: {
    color: "bg-gray-500 text-white hover:bg-gray-600",
    icon: Shield,
    defaultLabel: "Info"
  },
  resolved: {
    color: "bg-green-500 text-white hover:bg-green-600",
    icon: CheckCircle,
    defaultLabel: "Resolved"
  }
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1"
};

export function ViolationBadge({ 
  type, 
  label, 
  count, 
  showIcon = true, 
  size = "md",
  className 
}: ViolationBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge className={cn(config.color, sizeClasses[size], "gap-1", className)}>
      {showIcon && <Icon className={cn(size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")} />}
      {displayLabel}
      {count !== undefined && count > 0 && (
        <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
          {count}
        </span>
      )}
    </Badge>
  );
}
