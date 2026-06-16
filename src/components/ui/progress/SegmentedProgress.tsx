import { cn } from "@/lib/utils";

interface SegmentedProgressProps {
  segments: number;
  completed: number;
  size?: "sm" | "md" | "lg";
  gap?: number;
  className?: string;
}

export function SegmentedProgress({
  segments,
  completed,
  size = "md",
  gap = 2,
  className,
}: SegmentedProgressProps) {
  const sizeStyles = { sm: "h-1", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("flex w-full", className)} style={{ gap }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-full transition-colors duration-300",
            sizeStyles[size],
            i < completed ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}
