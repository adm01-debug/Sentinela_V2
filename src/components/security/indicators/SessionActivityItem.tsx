import React from 'react';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Monitor, Smartphone, Laptop, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SessionActivityProps {
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  lastActive: string;
  isCurrent?: boolean;
  isSecure?: boolean;
  onRevoke?: () => void;
}

const DEVICE_ICONS: Record<SessionActivityProps['deviceType'], LucideIcon> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Laptop,
};

const DEVICE_LABEL: Record<SessionActivityProps['deviceType'], string> = {
  desktop: 'Computador',
  mobile: 'Celular',
  tablet: 'Tablet',
};

export const SessionActivityItem: React.FC<SessionActivityProps> = ({
  device,
  deviceType,
  location,
  lastActive,
  isCurrent = false,
  isSecure = true,
}) => {
  const DeviceIcon = DEVICE_ICONS[deviceType];
  const secureLabel = isSecure ? 'Conexão segura' : 'Conexão não totalmente segura';

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-elevation-1 transition-shadow gap-4"
      aria-label={`Sessão em ${device}${isCurrent ? ' (atual)' : ''}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={cn(
            'p-2 rounded-lg shrink-0',
            isCurrent ? 'bg-primary/15' : 'bg-muted',
          )}
        >
          <DeviceIcon
            className={cn('h-5 w-5', isCurrent ? 'text-primary' : 'text-muted-foreground')}
            aria-label={DEVICE_LABEL[deviceType]}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{device}</span>
            {isCurrent && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Atual
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="truncate">{location}</span>
            <span aria-hidden="true">•</span>
            <span>{lastActive}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger aria-label={secureLabel}>
              {isSecure ? (
                <Lock className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Unlock className="h-4 w-4 text-warning" aria-hidden="true" />
              )}
            </TooltipTrigger>
            <TooltipContent>{secureLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
