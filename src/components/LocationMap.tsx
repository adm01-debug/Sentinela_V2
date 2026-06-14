import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  locations?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  onLocationSelect?: (locationId: string) => void;
  className?: string;
}

export function LocationMap({
  latitude,
  longitude,
  locations = [],
  onLocationSelect: _onLocationSelect,
  className,
}: LocationMapProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p>Map integration placeholder</p>
            {latitude && longitude && (
              <p className="text-sm mt-2">
                Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
              </p>
            )}
            {locations.length > 0 && (
              <p className="text-sm mt-2">{locations.length} locations</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LocationMap;
