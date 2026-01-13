import React from "react";
import { Alert, AlertTitle, AlertDescription } from "../ui/Alert";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface SecurityAlertProps {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp?: string;
  onDismiss?: () => void;
}

export function SecurityAlert({ severity, title, description, timestamp, onDismiss }: SecurityAlertProps) {
  const severityConfig = {
    critical: { icon: ShieldAlert, variant: "destructive" as const, bg: "bg-red-50" },
    high: { icon: AlertTriangle, variant: "destructive" as const, bg: "bg-orange-50" },
    medium: { icon: AlertTriangle, variant: "default" as const, bg: "bg-yellow-50" },
    low: { icon: ShieldCheck, variant: "default" as const, bg: "bg-blue-50" }
  };
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={config.bg}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && <button onClick={onDismiss} className="text-xs">Dismiss</button>}
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {timestamp && <p className="text-xs mt-2 opacity-60">{timestamp}</p>}
    </Alert>
  );
}
