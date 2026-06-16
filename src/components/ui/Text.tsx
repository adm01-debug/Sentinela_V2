import * as React from "react";
import { cn } from "@/utils/cn";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  muted?: boolean;
}

const sizeClasses = { xs: "text-xs", sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" };
const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Text({
  as: Component = "p",
  size = "md",
  weight = "normal",
  muted = false,
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        muted ? "text-muted-foreground" : "text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
