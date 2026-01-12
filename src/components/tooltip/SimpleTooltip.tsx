import { ReactNode } from 'react';
import { Tooltip as TooltipPrimitive, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function SimpleTooltip({ content, children, side = 'top', delayDuration = 300 }: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
}
