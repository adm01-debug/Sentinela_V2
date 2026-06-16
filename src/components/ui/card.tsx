import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-md border bg-card text-card-foreground transition-all duration-150",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-[var(--elevation-2)] hover:shadow-[var(--elevation-3)]",
        glass: "bg-card/80 backdrop-blur-xl border-border/50 shadow-[var(--elevation-2)]",
        outline: "border shadow-none",
        ghost: "border-transparent shadow-none bg-transparent",
        interactive:
          "shadow-sm hover:shadow-[var(--elevation-2)] hover:border-primary/20 cursor-pointer",
        gradient: "bg-gradient-card border-border/50",
        premium: "bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/20",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        destructive: "border-destructive/20 bg-destructive/5",
        info: "border-info/20 bg-info/5",
      },
      padding: {
        none: "",
        sm: "[&>*:first-child]:p-3 [&>*:first-child]:pb-1.5 [&>*:not(:first-child)]:p-3 [&>*:not(:first-child)]:pt-0",
        default:
          "[&>*:first-child]:p-4 [&>*:first-child]:pb-1.5 [&>*:not(:first-child)]:p-4 [&>*:not(:first-child)]:pt-0",
        lg: "[&>*:first-child]:p-6 [&>*:first-child]:pb-2 [&>*:not(:first-child)]:p-6 [&>*:not(:first-child)]:pt-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, className }))} {...props} />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
