import React from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// COPY BUTTON
// ============================================

interface CopyButtonProps {
  value: string;
  onCopy?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export function CopyButton({
  value,
  onCopy,
  size = 'md',
  variant = 'ghost',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy?.(value);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            className={cn(sizeStyles[size], className)}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className={cn(iconSizes[size], 'text-green-500')} />
            ) : (
              <Copy className={iconSizes[size]} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copiado!' : 'Copiar'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// EXTERNAL LINK BUTTON
// ============================================

interface ExternalLinkButtonProps {
  href: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default' | 'link';
  className?: string;
}

export function ExternalLinkButton({
  href,
  label,
  size = 'md',
  variant = 'link',
  className,
}: ExternalLinkButtonProps) {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (label) {
    return (
      <Button
        variant={variant}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        className={cn('gap-1', className)}
        asChild
      >
        <a href={href} target="_blank" rel="noopener noreferrer">
          {label}
          <ExternalLink className={iconSizes[size]} />
        </a>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            asChild
          >
            <a href={href} target="_blank" rel="noopener noreferrer">
              <ExternalLink className={iconSizes[size]} />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Abrir em nova aba</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// ACTION BUTTON GROUP
// ============================================

interface ActionButtonGroupProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ActionButtonGroup({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  showLabels = false,
  size = 'md',
  className,
}: ActionButtonGroupProps) {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const buttonSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
  };

  const actions = [
    { icon: Eye, label: 'Ver', onClick: onView, show: !!onView },
    { icon: Pencil, label: 'Editar', onClick: onEdit, show: !!onEdit },
    { icon: Download, label: 'Download', onClick: onDownload, show: !!onDownload },
    { icon: Share2, label: 'Compartilhar', onClick: onShare, show: !!onShare },
    { icon: Trash2, label: 'Excluir', onClick: onDelete, show: !!onDelete, destructive: true },
  ].filter((a) => a.show);

  if (actions.length === 0) return null;

  if (actions.length <= 3 || showLabels) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {actions.map((action, i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    buttonSizes[size],
                    action.destructive && 'text-destructive hover:text-destructive'
                  )}
                  onClick={action.onClick}
                >
                  <action.icon className={iconSizes[size]} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  // Collapse into dropdown if more than 3 actions
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonSizes[size]}>
          <MoreHorizontal className={iconSizes[size]} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, i) => (
          <React.Fragment key={i}>
            {action.destructive && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.destructive ? 'text-destructive focus:text-destructive' : ''}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// TOGGLE VISIBILITY BUTTON
// ============================================

interface ToggleVisibilityButtonProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToggleVisibilityButton({
  isVisible,
  onToggle,
  size = 'md',
  className,
}: ToggleVisibilityButtonProps) {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const buttonSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(buttonSizes[size], className)}
            onClick={() => onToggle(!isVisible)}
          >
            {isVisible ? (
              <Eye className={iconSizes[size]} />
            ) : (
              <EyeOff className={cn(iconSizes[size], 'text-muted-foreground')} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isVisible ? 'Ocultar' : 'Mostrar'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// ICON BUTTON WITH BADGE
// ============================================

interface IconButtonWithBadgeProps {
  icon: React.ElementType;
  badge?: number | string;
  onClick?: () => void;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export function IconButtonWithBadge({
  icon: Icon,
  badge,
  onClick,
  tooltip,
  size = 'md',
  variant = 'ghost',
  className,
}: IconButtonWithBadgeProps) {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const button = (
    <Button
      variant={variant}
      size="icon"
      className={cn('relative', buttonSizes[size], className)}
      onClick={onClick}
    >
      <Icon className={iconSizes[size]} />
      {badge !== undefined && badge !== 0 && (
        <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center px-1">
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

export default {
  CopyButton,
  ExternalLinkButton,
  ActionButtonGroup,
  ToggleVisibilityButton,
  IconButtonWithBadge,
};
