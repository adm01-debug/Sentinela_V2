import { useMemo } from "react";
import { OsmMap, type OsmMapMarker } from "@/components/map/OsmMap";

export interface MobileDevicesMapDevice {
  id: string;
  device_id: string;
  employee_name: string;
  last_location?: { lat: number; lng: number } | null;
  is_online: boolean;
}

interface MobileDevicesMapProps<T extends MobileDevicesMapDevice> {
  devices?: T[];
  selectedDeviceId?: string | null;
  onDeviceClick?: (device: T) => void;
  className?: string;
}

export function MobileDevicesMap<T extends MobileDevicesMapDevice>({
  devices = [],
  selectedDeviceId,
  onDeviceClick,
  className,
}: MobileDevicesMapProps<T>) {
  const withLocation = useMemo(
    () => devices.filter((device) => device.last_location != null),
    [devices]
  );

  const byMarkerId = useMemo(() => {
    const map = new Map<string, T>();
    withLocation.forEach((device) => map.set(`device-${device.id}`, device));
    return map;
  }, [withLocation]);

  const markers = useMemo<OsmMapMarker[]>(
    () =>
      withLocation.map((device) => ({
        id: `device-${device.id}`,
        latitude: device.last_location!.lat,
        longitude: device.last_location!.lng,
        label: device.employee_name,
        description: `${device.device_id} - ${device.is_online ? "ativo" : "desativado"}`,
        tone: device.is_online ? "online" : "offline",
      })),
    [withLocation]
  );

  const missing = devices.length - withLocation.length;

  return (
    <div className="space-y-2">
      <OsmMap
        markers={markers}
        selectedId={selectedDeviceId ? `device-${selectedDeviceId}` : null}
        ariaLabel="Mapa dos aparelhos monitorados"
        className={className}
        onMarkerClick={(markerId) => {
          const device = byMarkerId.get(markerId);
          if (device) onDeviceClick?.(device);
        }}
      />
      <p className="text-muted-foreground text-xs">
        {withLocation.length === 0
          ? "Nenhum aparelho enviou localizacao ainda."
          : `${withLocation.length} de ${devices.length} aparelho(s) com localizacao conhecida.`}
        {missing > 0 && withLocation.length > 0
          ? " Clique em um ponto para abrir as atividades do aparelho."
          : ""}
      </p>
    </div>
  );
}

export default MobileDevicesMap;
