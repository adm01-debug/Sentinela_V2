import { cn } from "@/lib/utils";

interface LinearProgressProps {
  value: number;
  max?: number;
  showValue?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export function LinearProgress({
  value,
  max = 100,
  showValue = false,
  label,
  size = "md",
  variant = "default",
  animated = false,
  striped = false,
  className,
}: LinearProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const sizeStyles = { sm: "h-1", md: "h-2", lg: "h-3" };
  const variantStyles = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-destructive",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1 flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-medium">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-muted", sizeStyles[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantStyles[variant],
            striped && "bg-stripes",
            animated && "animate-progress-stripes"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
