import { memo, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export interface FABAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export interface FloatingActionButtonProps {
  actions?: FABAction[];
  icon?: ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
}

const positionClasses = {
  'bottom-right': 'bottom-20 right-4 sm:bottom-6',
  'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2 sm:bottom-6',
  'bottom-left': 'bottom-20 left-4 sm:bottom-6',
};

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
};

const colorClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

function FloatingActionButtonComponent({
  actions,
  icon,
  onClick,
  position = 'bottom-right',
  size = 'md',
  className,
  showLabels = true,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    if (actions && actions.length > 0) {
      setIsExpanded((prev) => !prev);
    } else if (onClick) {
      onClick();
    }
  }, [actions, onClick]);

  const handleActionClick = useCallback((action: FABAction) => {
    action.onClick();
    setIsExpanded(false);
  }, []);

  const hasMultipleActions = actions && actions.length > 0;

  return (
    <div
      className={cn(
        'fixed z-40 flex flex-col items-end gap-3',
        positionClasses[position],
        className
      )}
    >
      {/* Actions */}
      <AnimatePresence>
        {isExpanded && hasMultipleActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-end gap-3 mb-2"
          >
            {actions!.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  {showLabels && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-3 py-1.5 bg-card border rounded-lg text-sm font-medium shadow-lg whitespace-nowrap"
                    >
                      {action.label}
                    </motion.span>
                  )}
                  <button
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'w-12 h-12 rounded-full shadow-lg flex items-center justify-center',
                      'transition-all duration-200 active:scale-95',
                      colorClasses[action.color || 'secondary']
                    )}
                  >
                    <ActionIcon className="h-5 w-5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={toggleExpanded}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        className={cn(
          'rounded-full shadow-xl flex items-center justify-center',
          'transition-colors duration-200',
          sizeClasses[size],
          colorClasses.primary
        )}
      >
        {icon || (hasMultipleActions ? (
          isExpanded ? (
            <X className={iconSizeClasses[size]} />
          ) : (
            <Plus className={iconSizeClasses[size]} />
          )
        ) : (
          <Plus className={iconSizeClasses[size]} />
        ))}
      </motion.button>
    </div>
  );
}

export const FloatingActionButton = memo(FloatingActionButtonComponent);
