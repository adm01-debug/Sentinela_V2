import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80",
        outline: "text-foreground border-border",
        ghost: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        premium: "border-transparent bg-gradient-primary text-primary-foreground",
        dot: "border-transparent bg-transparent text-foreground pl-0",
      },
      size: {
        sm: "px-2 py-0 text-2xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: "default" | "success" | "warning" | "destructive" | "info";
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({
  className,
  variant,
  size,
  dot,
  dotColor = "default",
  removable,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  const dotColors = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
  };

  return (
    <div
      className={cn(badgeVariants({ variant: dot ? "dot" : variant, size }), className)}
      {...props}
    >
      {dot && <span className={cn("mr-1.5 h-2 w-2 rounded-full", dotColors[dotColor])} />}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
