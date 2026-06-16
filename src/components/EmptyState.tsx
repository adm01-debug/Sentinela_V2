import { memo, type ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  children?: ReactNode;
}

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}
    >
      {/* Branded icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/15 to-accent/15">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>

      <h3 className="mb-1.5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>

      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
});

export default EmptyState;
