import React from 'react';
import { MapPin } from 'lucide-react';

interface MobileDevice {
  id: string;
  device_id: string;
  employee_name: string;
  os_type: string;
  last_location_lat: number | null;
  last_location_lng: number | null;
  is_active: boolean;
}

interface MobileDevicesMapProps {
  devices?: MobileDevice[];
  selectedDeviceId?: string;
  onDeviceClick?: (device: MobileDevice) => void;
}

export function MobileDevicesMap({ devices = [], selectedDeviceId: _selectedDeviceId, onDeviceClick: _onDeviceClick }: MobileDevicesMapProps) {
  return (
    <div className="h-full bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-2" />
        <p>Mobile devices map placeholder</p>
        {devices.length > 0 && (
          <p className="text-sm mt-2">{devices.length} devices</p>
        )}
      </div>
    </div>
  );
}

export default MobileDevicesMap;
