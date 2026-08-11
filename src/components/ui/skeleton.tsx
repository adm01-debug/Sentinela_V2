import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text" | "rectangular";
  animation?: "pulse" | "shimmer" | "none";
}

function Skeleton({ 
  className, 
  variant = "default",
  animation = "pulse",
  ...props 
}: SkeletonProps) {
  const variants = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4 w-full",
    rectangular: "rounded-none",
  };

  const animations = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]",
    none: "",
  };

  return (
    <div 
      className={cn(
        "bg-muted",
        variants[variant],
        animations[animation],
        className
      )} 
      {...props} 
    />
  );
}

// Pre-built skeleton components
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? "w-3/4" : "w-full"} 
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonAvatar({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizes = { sm: "h-8 w-8", default: "h-10 w-10", lg: "h-14 w-14" };
  return <Skeleton variant="circular" className={sizes[size]} />;
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar };