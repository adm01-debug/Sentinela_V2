import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
  orientation = "horizontal",
}: StepperProps) {
  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col space-y-4" : "items-center justify-between",
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <React.Fragment key={step.id}>
            <div
              role={onStepClick ? "button" : undefined}
              tabIndex={onStepClick ? 0 : undefined}
              className={cn(
                "flex items-center",
                orientation === "vertical" && "flex-row",
                onStepClick && "cursor-pointer"
              )}
              onClick={() => onStepClick?.(index)}
              onKeyDown={
                onStepClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onStepClick(index);
                      }
                    }
                  : undefined
              }
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
              </div>
              <div className={cn("ml-3", orientation === "horizontal" && "hidden md:block")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1",
                  orientation === "vertical" ? "ml-5 h-8 w-0.5" : "mx-4 h-0.5",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface StepContentProps {
  step: number;
  currentStep: number;
  children: React.ReactNode;
  className?: string;
}
export function StepContent({ step, currentStep, children, className }: StepContentProps) {
  if (step !== currentStep) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}
