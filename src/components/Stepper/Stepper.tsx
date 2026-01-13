import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
}

export function Stepper({ steps, currentStep, orientation = "horizontal" }: StepperProps) {
  return (
    <div className={cn("flex", orientation === "vertical" ? "flex-col space-y-4" : "items-center")}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
              index < currentStep ? "bg-primary border-primary text-primary-foreground" :
              index === currentStep ? "border-primary text-primary" : "border-muted text-muted-foreground"
            )}>
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div className="ml-3">
              <p className={cn("text-sm font-medium", index <= currentStep ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
              {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
            </div>
          </div>
          {index < steps.length - 1 && orientation === "horizontal" && (
            <div className={cn("flex-1 h-0.5 mx-4", index < currentStep ? "bg-primary" : "bg-muted")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
