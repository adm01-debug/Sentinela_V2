import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronRight, MoreVertical } from 'lucide-react';

export interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  showChevron?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
}

const variantClasses = {
  default: 'bg-card border',
  elevated: 'bg-card shadow-lg',
  outlined: 'bg-transparent border-2',
  ghost: 'bg-muted/50',
};

function MobileCardComponent({
  children,
  className,
  onClick,
  interactive = false,
  showChevron = false,
  showMenu = false,
  onMenuClick,
  header,
  footer,
  variant = 'default',
}: MobileCardProps) {
  const isClickable = interactive || onClick;

  const CardWrapper = isClickable ? motion.button : 'div';
  const cardProps = isClickable
    ? {
        onClick,
        whileTap: { scale: 0.98 },
        transition: { duration: 0.1 },
      }
    : {};

  return (
    <CardWrapper
      {...cardProps}
      className={cn(
        'rounded-xl p-4 w-full text-left',
        'transition-all duration-200',
        variantClasses[variant],
        isClickable && 'cursor-pointer hover:shadow-md active:shadow-sm',
        className
      )}
    >
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between mb-3">
          {header}
          {showMenu && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.();
              }}
              className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn('flex items-center gap-3', showChevron && 'pr-8')}>
        <div className="flex-1 min-w-0">{children}</div>
        {showChevron && (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 absolute right-4" />
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-3 pt-3 border-t">{footer}</div>
      )}
    </CardWrapper>
  );
}

export const MobileCard = memo(MobileCardComponent);

// List Item variant for mobile lists
export interface MobileListItemProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string | number;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}

function MobileListItemComponent({
  icon,
  title,
  subtitle,
  value,
  trailing,
  onClick,
  className,
  destructive = false,
}: MobileListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3 text-left',
        'transition-colors duration-150',
        'hover:bg-muted/50 active:bg-muted',
        destructive && 'text-destructive',
        className
      )}
    >
      {icon && (
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          destructive ? 'bg-destructive/10' : 'bg-muted'
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', destructive && 'text-destructive')}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {value !== undefined && (
        <span className="text-sm font-medium text-muted-foreground">{value}</span>
      )}
      {trailing || (onClick && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />)}
    </button>
  );
}

export const MobileListItem = memo(MobileListItemComponent);

// Section Header for mobile
export interface MobileSectionHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

function MobileSectionHeaderComponent({
  title,
  action,
  className,
}: MobileSectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-2', className)}>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      {action}
    </div>
  );
}

export const MobileSectionHeader = memo(MobileSectionHeaderComponent);
