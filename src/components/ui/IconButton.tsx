import { memo, forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon;
  tooltip?: string;
  iconClassName?: string;
}

const IconButtonComponent = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, tooltip, iconClassName, className, ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={className}
        {...props}
      >
        <Icon className={cn("h-4 w-4", iconClassName)} />
      </Button>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);

IconButtonComponent.displayName = 'IconButton';

export const IconButton = memo(IconButtonComponent);
