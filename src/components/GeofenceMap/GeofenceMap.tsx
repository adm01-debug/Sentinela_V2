import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MapPin, Circle } from "lucide-react";

interface GeofenceMapProps {
  center: { lat: number; lng: number };
  radius: number;
  employees?: Array<{ id: string; name: string; position: { lat: number; lng: number } }>;
  onEmployeeClick?: (id: string) => void;
}

export function GeofenceMap({ center, radius, employees = [], onEmployeeClick }: GeofenceMapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geofence Area
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <Circle className="h-32 w-32 text-blue-500/30" fill="currentColor" />
          </div>
          <div className="text-center z-10">
            <p className="font-medium">Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
            <p className="text-sm text-muted-foreground">Radius: {radius}m</p>
            <p className="text-sm mt-2">{employees.length} employees in area</p>
          </div>
        </div>
        {employees.length > 0 && (
          <div className="mt-4 space-y-2">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer" onClick={() => onEmployeeClick?.(emp.id)}>
                <MapPin className="h-4 w-4 text-green-500" />
                <span>{emp.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
