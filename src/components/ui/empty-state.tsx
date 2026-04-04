import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-36 mx-auto mb-4"
      aria-hidden="true"
    >
      {/* Desk */}
      <rect x="40" y="100" width="120" height="8" rx="4" className="fill-muted" />
      <rect x="55" y="108" width="8" height="30" rx="2" className="fill-muted-foreground/20" />
      <rect x="137" y="108" width="8" height="30" rx="2" className="fill-muted-foreground/20" />
      
      {/* Monitor */}
      <rect x="60" y="50" width="80" height="50" rx="6" className="fill-muted stroke-border" strokeWidth="2" />
      <rect x="66" y="56" width="68" height="38" rx="3" className="fill-background" />
      <rect x="92" y="100" width="16" height="6" rx="2" className="fill-muted-foreground/20" />
      
      {/* Screen content - empty state lines */}
      <rect x="76" y="66" width="48" height="3" rx="1.5" className="fill-primary/20" />
      <rect x="82" y="73" width="36" height="2" rx="1" className="fill-muted-foreground/15" />
      <rect x="86" y="79" width="28" height="2" rx="1" className="fill-muted-foreground/10" />
      
      {/* Magnifying glass */}
      <circle cx="155" cy="45" r="14" className="stroke-primary/40" strokeWidth="2.5" fill="none" />
      <line x1="165" y1="55" x2="175" y2="65" className="stroke-primary/40" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="155" cy="45" r="6" className="fill-primary/10" />
      
      {/* Small decorative elements */}
      <circle cx="35" cy="70" r="3" className="fill-primary/15" />
      <circle cx="170" cy="85" r="2" className="fill-warning/20" />
      <rect x="25" y="90" width="6" height="6" rx="1" className="fill-success/15" transform="rotate(15 28 93)" />
    </svg>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      <EmptyIllustration />
      
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
      
      {children}
    </div>
  );
}
