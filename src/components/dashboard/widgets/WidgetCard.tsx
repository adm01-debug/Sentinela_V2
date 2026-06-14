import { memo, ReactNode } from 'react';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

function WidgetCardComponent({ title, subtitle, children, className, actions, loading = false, error, onRetry, infoTooltip }: WidgetCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={cn('bg-card border rounded-xl p-4 sm:p-6 transition-shadow duration-200 hover:shadow-md', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {infoTooltip && <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent>{infoTooltip}</TooltipContent></Tooltip>}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          {onRetry && <button onClick={onRetry} className="text-sm text-primary hover:underline">Tentar novamente</button>}
        </div>
      ) : children}
    </motion.div>
  );
}

export const WidgetCard = memo(WidgetCardComponent);
