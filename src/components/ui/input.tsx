import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, X, Search, AlertCircle, CheckCircle } from "lucide-react";

const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-foreground ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        ghost: "border-transparent bg-muted/50 focus-visible:bg-background",
        outline: "border-2 border-input focus-visible:border-primary",
        filled: "border-transparent bg-muted focus-visible:bg-background focus-visible:border-input",
        success: "border-success/50 bg-success/5 focus-visible:ring-success",
        error: "border-destructive/50 bg-destructive/5 focus-visible:ring-destructive",
        warning: "border-warning/50 bg-warning/5 focus-visible:ring-warning",
      },
      inputSize: {
        sm: "h-8 px-2.5 py-1 text-xs",
        default: "h-10 px-3 py-2 text-sm md:text-sm",
        lg: "h-12 px-4 py-3 text-base",
        xl: "h-14 px-5 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  showPasswordToggle?: boolean;
  status?: "success" | "error" | "warning";
  statusMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      showPasswordToggle,
      status,
      statusMessage,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
    };

    const inputType = type === "password" && showPassword ? "text" : type;

    const getStatusVariant = () => {
      if (status === "success") return "success";
      if (status === "error") return "error";
      if (status === "warning") return "warning";
      return variant;
    };

    const StatusIcon = () => {
      if (status === "success") return <CheckCircle className="h-4 w-4 text-success" />;
      if (status === "error") return <AlertCircle className="h-4 w-4 text-destructive" />;
      if (status === "warning") return <AlertCircle className="h-4 w-4 text-warning" />;
      return null;
    };

    const hasRightContent = rightIcon || clearable || showPasswordToggle || status;

    return (
      <div className="relative w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: getStatusVariant(), inputSize }),
              leftIcon && "pl-10",
              hasRightContent && "pr-10",
              className
            )}
            ref={ref}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            {...props}
          />
          {hasRightContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {clearable && String(internalValue).length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showPasswordToggle && type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
              {status && <StatusIcon />}
              {rightIcon && !status && rightIcon}
            </div>
          )}
        </div>
        {statusMessage && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              status === "error" && "text-destructive",
              status === "warning" && "text-warning",
              status === "success" && "text-success"
            )}
          >
            {statusMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Search Input variant
const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "leftIcon">>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      leftIcon={<Search className="h-4 w-4" />}
      clearable
      placeholder="Search..."
      className={className}
      {...props}
    />
  )
);
SearchInput.displayName = "SearchInput";

export { Input, SearchInput, inputVariants };