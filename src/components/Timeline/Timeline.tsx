import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: "completed" | "current" | "pending";
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function Timeline({ items, orientation = "vertical", className }: TimelineProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "current":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (orientation === "horizontal") {
    return (
      <div className={cn("flex items-start gap-4 overflow-x-auto", className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-[120px]">
              {item.icon || getStatusIcon(item.status)}
              <h4 className="mt-2 text-sm font-medium text-center">{item.title}</h4>
              {item.description && (
                <p className="text-xs text-muted-foreground text-center">{item.description}</p>
              )}
              {item.timestamp && (
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              )}
            </div>
            {index < items.length - 1 && (
              <div className={cn(
                "h-0.5 w-12 mx-2",
                item.status === "completed" ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            {item.icon || getStatusIcon(item.status)}
            {index < items.length - 1 && (
              <div className={cn(
                "w-0.5 flex-1 mt-2",
                item.status === "completed" ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
          <div className="flex-1 pb-4">
            <h4 className="text-sm font-medium">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            )}
            {item.timestamp && (
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
