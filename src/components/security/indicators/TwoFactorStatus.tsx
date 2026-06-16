import React from "react";
import { Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TwoFactorStatusProps {
  enabled: boolean;
  methods?: string[];
  className?: string;
}

export const TwoFactorStatus: React.FC<TwoFactorStatusProps> = ({
  enabled,
  methods = [],
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4",
        enabled ? "border-success/20 bg-success/5" : "bg-muted",
        className
      )}
    >
      <div className={cn("rounded-full p-2", enabled ? "bg-success/10" : "bg-muted")}>
        <Key className={cn("h-5 w-5", enabled ? "text-success" : "text-muted-foreground")} />
      </div>
      <div className="flex-1">
        <p className="font-medium">Two-Factor Authentication</p>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? `Enabled with ${methods.join(", ")}`
            : "Not enabled - your account is less secure"}
        </p>
      </div>
      <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Active" : "Inactive"}</Badge>
    </div>
  );
};
