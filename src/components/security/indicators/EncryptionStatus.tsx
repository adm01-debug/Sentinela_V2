import React from 'react';
import { cn } from '@/lib/utils';
import { Lock, Unlock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EncryptionStatusProps {
  encrypted: boolean;
  algorithm?: string;
  className?: string;
}

export const EncryptionStatus: React.FC<EncryptionStatusProps> = ({
  encrypted,
  algorithm,
  className,
}) => {
  const tooltipText = encrypted
    ? `Dados criptografados${algorithm ? ` com ${algorithm}` : ''}`
    : 'Dados não estão criptografados';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn('flex items-center gap-2', className)}
            role="status"
            aria-label={tooltipText}
          >
            {encrypted ? (
              <>
                <Lock className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                <span className="text-sm text-success">Criptografado</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                <span className="text-sm text-destructive">Não Criptografado</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
