import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        default: "h-10 w-10",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
      },
      status: {
        none: "",
        online: "",
        offline: "",
        busy: "",
        away: "",
      },
    },
    defaultVariants: {
      size: "default",
      status: "none",
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  ring?: boolean;
  ringColor?: "primary" | "success" | "warning" | "destructive" | "info";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, status, ring, ringColor = "primary", ...props }, ref) => {
  const ringColors = {
    primary: "ring-primary",
    success: "ring-success",
    warning: "ring-warning",
    destructive: "ring-destructive",
    info: "ring-info",
  };

  const statusColors = {
    none: "",
    online: "bg-success",
    offline: "bg-muted-foreground",
    busy: "bg-destructive",
    away: "bg-warning",
  };

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          avatarVariants({ size, status }),
          ring && `ring-2 ring-offset-2 ring-offset-background ${ringColors[ringColor]}`,
          className
        )}
        {...props}
      />
      {status && status !== "none" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            statusColors[status],
            size === "xs" && "h-1.5 w-1.5",
            size === "sm" && "h-2 w-2",
            (size === "default" || !size) && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3",
            size === "xl" && "h-3.5 w-3.5",
            size === "2xl" && "h-4 w-4"
          )}
        />
      )}
    </div>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Avatar Group component
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
  className?: string;
}

const AvatarGroup = ({ children, max = 4, size = "default", className }: AvatarGroupProps) => {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const sizeClasses = {
    xs: "h-6 w-6 text-2xs",
    sm: "h-8 w-8 text-xs",
    default: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
    "2xl": "h-20 w-20 text-xl",
  };

  const overlapClasses = {
    xs: "-ml-2",
    sm: "-ml-2.5",
    default: "-ml-3",
    lg: "-ml-4",
    xl: "-ml-5",
    "2xl": "-ml-6",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={cn(
            "ring-2 ring-background rounded-full",
            index > 0 && overlapClasses[size]
          )}
        >
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            sizeClasses[size],
            overlapClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants };