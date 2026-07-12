import { memo, type ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconBadgeVariants = cva(
  'inline-flex items-center justify-center shrink-0 transition-colors',
  {
    variants: {
      tone: {
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        destructive: 'bg-destructive/10 text-destructive',
        info: 'bg-accent/10 text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
        md: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
        lg: 'h-12 w-12 [&>svg]:h-6 [&>svg]:w-6',
      },
      shape: {
        square: 'rounded-lg',
        rounded: 'rounded-xl',
        circle: 'rounded-pill',
      },
    },
    defaultVariants: {
      tone: 'primary',
      size: 'md',
      shape: 'rounded',
    },
  }
);

export interface IconBadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'children'>,
    VariantProps<typeof iconBadgeVariants> {
  icon: LucideIcon;
  label?: string;
}

export const IconBadge = memo(function IconBadge({
  icon: Icon,
  tone,
  size,
  shape,
  className,
  label,
  ...rest
}: IconBadgeProps) {
  return (
    <span
      className={cn(iconBadgeVariants({ tone, size, shape }), className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <Icon />
    </span>
  );
});

export default IconBadge;
