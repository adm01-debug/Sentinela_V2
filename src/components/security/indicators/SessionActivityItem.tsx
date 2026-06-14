import React from 'react';
import { Lock, Unlock, Monitor, Smartphone, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
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

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Laptop,
};

export const SessionActivityItem: React.FC<SessionActivityProps> = ({
  device,
  deviceType,
  location,
  lastActive,
  isCurrent = false,
  isSecure = true,
}) => {
  const DeviceIcon = deviceIcons[deviceType];

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-elevation-1 transition-shadow">
      <div className="flex items-center gap-4">
        <div className={cn('p-2 rounded-lg', isCurrent ? 'bg-primary/10' : 'bg-muted')}>
          <DeviceIcon className={cn('h-5 w-5', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{device}</span>
            {isCurrent && <Badge variant="secondary" className="text-xs">Current</Badge>}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{location}</span>
            <span>•</span>
            <span>{lastActive}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {isSecure ? (
                <Lock className="h-4 w-4 text-success" />
              ) : (
                <Unlock className="h-4 w-4 text-warning" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {isSecure ? 'Secure connection' : 'Connection not fully secure'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
