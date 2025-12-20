import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Battery, BatteryCharging, Smartphone, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MobileDevice {
  id: string;
  employee_name: string;
  device_model: string;
  os: string;
  battery_level: number;
  is_charging: boolean;
  is_online: boolean;
  last_seen: string;
  last_location?: { lat: number; lng: number };
}

interface MobileDeviceCardProps {
  device: MobileDevice;
  isSelected?: boolean;
  onClick: () => void;
}

function MobileDeviceCardComponent({ device, isSelected, onClick }: MobileDeviceCardProps) {
  const BatteryIcon = device.is_charging ? BatteryCharging : Battery;
  const batteryColor = device.battery_level < 20 ? 'text-red-500' : 
                       device.battery_level < 50 ? 'text-yellow-500' : 'text-green-500';

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
              <span
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  device.is_online ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div>
              <p className="font-medium">{device.employee_name}</p>
              <p className="text-sm text-muted-foreground">{device.device_model}</p>
              <p className="text-xs text-muted-foreground">{device.os}</p>
            </div>
          </div>

          <div className="text-right">
            <div className={`flex items-center gap-1 ${batteryColor}`}>
              <BatteryIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{device.battery_level}%</span>
            </div>
            <Badge variant={device.is_online ? 'default' : 'secondary'} className="mt-1">
              {device.is_online ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true, locale: ptBR })}
          </span>
          {device.last_location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              GPS ativo
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const MobileDeviceCard = memo(MobileDeviceCardComponent);
