import { memo, ReactNode } from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface WidgetCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  infoTooltip?: string;
}

function WidgetCardComponent({
  title,
  subtitle,
  children,
  className,
  actions,
  loading = false,
  error,
  onRetry,
  infoTooltip,
}: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border bg-card p-4 transition-shadow duration-200 hover:shadow-md sm:p-6",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {infoTooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>{infoTooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="mb-2 text-sm text-destructive">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="text-sm text-primary hover:underline">
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

export const WidgetCard = memo(WidgetCardComponent);
