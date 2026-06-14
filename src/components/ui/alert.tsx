import * as React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 transition-all duration-200 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        info: "bg-info/10 text-foreground border-info/30 [&>svg]:text-info dark:bg-info/20",
        success: "bg-success/10 text-foreground border-success/30 [&>svg]:text-success dark:bg-success/20",
        warning: "bg-warning/10 text-foreground border-warning/30 [&>svg]:text-warning dark:bg-warning/20",
        destructive: "bg-destructive/10 text-foreground border-destructive/30 [&>svg]:text-destructive dark:bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
    VariantProps<typeof alertVariants> & {
      dismissible?: boolean;
      onDismiss?: () => void;
      icon?: React.ReactNode;
    }
>(({ className, variant, dismissible, onDismiss, icon, children, ...props }, ref) => {
  const defaultIcons = {
    default: null,
    info: <Info className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    destructive: <AlertCircle className="h-5 w-5" />,
  };

  const IconToRender = icon !== undefined ? icon : defaultIcons[variant || "default"];

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {IconToRender}
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </div>
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// Inline alert for forms
interface InlineAlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

const InlineAlert = ({ type, message, className }: InlineAlertProps) => {
  const styles = {
    success: "text-success",
    error: "text-destructive",
    warning: "text-warning",
    info: "text-info",
  };

  const icons = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm", styles[type], className)}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription, InlineAlert, alertVariants };