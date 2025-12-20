import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, MoreVertical, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  last_seen: string;
  is_active: boolean;
  employee?: { name: string };
  ip_address: string;
}

interface DeviceCardProps {
  device: Device;
  onViewDetails: (device: Device) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export const DeviceCard = React.memo(function DeviceCard({
  device,
  onViewDetails,
  onDeactivate,
  onReactivate,
}: DeviceCardProps) {
  const Icon = deviceIcons[device.type] || Monitor;

  return (
    <Card className={!device.is_active ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">{device.name}</h3>
              <p className="text-sm text-muted-foreground">{device.os}</p>
              {device.employee && (
                <p className="text-sm text-muted-foreground">{device.employee.name}</p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(device)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              {device.is_active ? (
                <DropdownMenuItem onClick={() => onDeactivate(device.id)}>
                  Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onReactivate(device.id)}>
                  Reativar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={device.is_active ? 'default' : 'secondary'}>
              {device.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {device.ip_address}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(device.last_seen), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
