import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
  description?: string;
  status?: "pending" | "current" | "completed" | "error";
}

interface StepProgressProps {
  steps: Step[];
  currentStep?: number;
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { circle: "h-6 w-6", icon: "h-3 w-3", text: "text-xs", gap: "gap-1" },
  md: { circle: "h-8 w-8", icon: "h-4 w-4", text: "text-sm", gap: "gap-2" },
  lg: { circle: "h-10 w-10", icon: "h-5 w-5", text: "text-base", gap: "gap-3" },
};

function StepCircle({
  status,
  size,
  index,
}: {
  status: string;
  size: "sm" | "md" | "lg";
  index: number;
}) {
  const config = sizeConfig[size];
  const statusStyles = {
    pending: "border-2 border-muted bg-background text-muted-foreground",
    current: "border-2 border-primary bg-primary text-primary-foreground",
    completed: "bg-primary text-primary-foreground",
    error: "bg-destructive text-destructive-foreground",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-sm font-medium",
        config.circle,
        statusStyles[status as keyof typeof statusStyles]
      )}
    >
      {status === "completed" ? (
        <Check className={config.icon} />
      ) : status === "current" ? (
        <Loader2 className={cn(config.icon, "animate-spin")} />
      ) : (
        <span className="text-xs">{index + 1}</span>
      )}
    </div>
  );
}

export function StepProgress({
  steps,
  currentStep = 0,
  variant = "horizontal",
  size = "md",
  showLabels = true,
  className,
}: StepProgressProps) {
  const config = sizeConfig[size];

  const getStepStatus = (index: number, step: Step) => {
    if (step.status) return step.status;
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col", className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index, step);
          const isLast = index === steps.length - 1;
          return (
            <div key={step.id} className="flex">
              <div className="mr-4 flex flex-col items-center">
                <StepCircle status={status} size={size} index={index} />
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 min-h-[40px] w-0.5 flex-1",
                      status === "completed" ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              {showLabels && (
                <div className={cn("pb-8", config.gap)}>
                  <p
                    className={cn(
                      "font-medium",
                      config.text,
                      status === "current" && "text-primary",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index, step);
        const isLast = index === steps.length - 1;
        return (
          <React.Fragment key={step.id}>
            <div className={cn("flex flex-col items-center", config.gap)}>
              <StepCircle status={status} size={size} index={index} />
              {showLabels && (
                <span
                  className={cn(
                    "max-w-[80px] truncate text-center",
                    config.text,
                    status === "current" && "font-medium text-primary",
                    status === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  status === "completed" ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
