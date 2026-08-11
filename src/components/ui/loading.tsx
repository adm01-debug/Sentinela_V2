import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "default" | "lg" | "xl";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    };

    return (
      <div ref={ref} className={cn("animate-spin text-primary", sizeClasses[size], className)} {...props}>
        <Loader2 className="h-full w-full" />
      </div>
    );
  }
);
Spinner.displayName = "Spinner";

// Loading overlay
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  blur?: boolean;
  spinnerSize?: "xs" | "sm" | "default" | "lg" | "xl";
  text?: string;
}

const LoadingOverlay = ({
  loading,
  children,
  blur = true,
  spinnerSize = "lg",
  text,
}: LoadingOverlayProps) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80",
            blur && "backdrop-blur-sm"
          )}
        >
          <Spinner size={spinnerSize} />
          {text && (
            <p className="mt-3 text-sm text-muted-foreground animate-pulse">{text}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Page loading state
interface PageLoadingProps {
  text?: string;
}

const PageLoading = ({ text = "Loading..." }: PageLoadingProps) => {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

// Button loading dots
const LoadingDots = ({ className }: { className?: string }) => {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
};

// Skeleton pulse loader
const PulseLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-3 w-3 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
};

export { Spinner, LoadingOverlay, PageLoading, LoadingDots, PulseLoader };