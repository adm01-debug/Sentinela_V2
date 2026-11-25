import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OsmMap, type OsmMapMarker } from "@/components/map/OsmMap";

interface LocationMapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  locations?: LocationMapLocation[];
  onLocationSelect?: (locationId: string) => void;
  className?: string;
}

export function LocationMap({
  latitude,
  longitude,
  locations = [],
  onLocationSelect,
  className,
}: LocationMapProps) {
  const markers = useMemo<OsmMapMarker[]>(() => {
    const fromLocations = locations.map((location) => ({
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      label: location.name,
    }));

    const hasPoint =
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude);

    return hasPoint
      ? [...fromLocations, { id: "current", latitude, longitude, label: "Ponto selecionado" }]
      : fromLocations;
  }, [locations, latitude, longitude]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OsmMap
          markers={markers}
          ariaLabel="Mapa de localizacoes"
          onMarkerClick={(markerId) => {
            if (markerId !== "current") onLocationSelect?.(markerId);
          }}
        />
        {markers.length > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            {markers.length} ponto(s) no mapa. Clique em um ponto para selecionar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default LocationMap;
