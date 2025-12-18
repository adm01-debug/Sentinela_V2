import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MobileDevice } from "@/hooks/useMobileDevices";
import { Loader2 } from "lucide-react";
import { useGeofences, Geofence } from "@/hooks/useGeofences";
import { toast } from "sonner";

interface MobileDevicesMapProps {
  devices: MobileDevice[];
}

export function MobileDevicesMap({ devices }: MobileDevicesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const geofenceSourcesRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { geofences } = useGeofences();
  const prevDevicePositions = useRef<Map<string, { lat: number; lng: number; insideGeofences: Set<string> }>>(new Map());

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token from edge function
        const { data, error: fetchError } = await supabase.functions.invoke("get-mapbox-token");
        
        if (fetchError || !data?.token) {
          setError("Não foi possível carregar o mapa. Token do Mapbox não configurado.");
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = data.token;

        // Calculate center based on devices with location
        const devicesWithLocation = devices.filter(
          (d) => d.last_location_lat && d.last_location_lng
        );

        let center: [number, number] = [-47.9292, -15.7801]; // Default: Brasília
        let zoom = 4;

        if (devicesWithLocation.length > 0) {
          const avgLat =
            devicesWithLocation.reduce((sum, d) => sum + (d.last_location_lat || 0), 0) /
            devicesWithLocation.length;
          const avgLng =
            devicesWithLocation.reduce((sum, d) => sum + (d.last_location_lng || 0), 0) /
            devicesWithLocation.length;
          center = [avgLng, avgLat];
          zoom = devicesWithLocation.length === 1 ? 14 : 10;
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center,
          zoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
          setLoading(false);
          updateMarkers();
          drawGeofences();
        });
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Erro ao inicializar o mapa");
        setLoading(false);
      }
    };

    initMap();

    return () => {
      markers.current.forEach((marker) => marker.remove());
      map.current?.remove();
    };
  }, []);

  const updateMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add markers for devices with location
    devices.forEach((device) => {
      if (!device.last_location_lat || !device.last_location_lng) return;

      const el = document.createElement("div");
      el.className = "device-marker";
      
      // Create pulsing animation for active devices
      const pulseRing = device.is_active ? `
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #22c55e;
          opacity: 0.4;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #22c55e;
          opacity: 0.2;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.5s;
        "></div>
      ` : '';

      el.innerHTML = `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${pulseRing}
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            background: ${device.is_active ? "#22c55e" : "#6b7280"};
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 1;
          ">
            ${device.os_type === "ios" ? "🍎" : "🤖"}
          </div>
        </div>
        <style>
          @keyframes pulse-ring {
            0% {
              transform: scale(1);
              opacity: 0.4;
            }
            50% {
              transform: scale(1.8);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
        </style>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="color: #1a1a1a; padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${device.employee_name}</h3>
          <p style="font-size: 12px; color: #666; margin: 2px 0;">
            ${device.device_model || "Dispositivo"} • ${device.os_type.toUpperCase()}
          </p>
          <p style="font-size: 12px; color: #666; margin: 2px 0;">
            Status: <span style="color: ${device.is_active ? "#22c55e" : "#6b7280"}; font-weight: 600;">
              ${device.is_active ? "🟢 Online" : "⚫ Offline"}
            </span>
          </p>
          ${device.last_seen_at ? `
            <p style="font-size: 11px; color: #999; margin-top: 8px;">
              Última atualização: ${new Date(device.last_seen_at).toLocaleString("pt-BR")}
            </p>
          ` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([device.last_location_lng, device.last_location_lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  const drawGeofences = () => {
    if (!map.current) return;

    // Remove existing geofence layers and sources
    geofenceSourcesRef.current.forEach((sourceId) => {
      if (map.current?.getLayer(`${sourceId}-fill`)) {
        map.current.removeLayer(`${sourceId}-fill`);
      }
      if (map.current?.getLayer(`${sourceId}-border`)) {
        map.current.removeLayer(`${sourceId}-border`);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
    geofenceSourcesRef.current = [];

    // Add geofence circles
    geofences.filter(g => g.is_active).forEach((geofence) => {
      const sourceId = `geofence-${geofence.id}`;
      geofenceSourcesRef.current.push(sourceId);

      // Create circle GeoJSON
      const circleGeoJSON = createCircleGeoJSON(
        geofence.longitude,
        geofence.latitude,
        geofence.radius_meters
      );

      map.current!.addSource(sourceId, {
        type: "geojson",
        data: circleGeoJSON,
      });

      // Add fill layer
      map.current!.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.15,
        },
      });

      // Add border layer
      map.current!.addLayer({
        id: `${sourceId}-border`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#22c55e",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });

      // Add geofence center marker with label
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="
          background: rgba(34, 197, 94, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          📍 ${geofence.name}
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([geofence.longitude, geofence.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="color: #1a1a1a; padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${geofence.name}</h3>
              ${geofence.description ? `<p style="font-size: 12px; color: #666; margin: 2px 0;">${geofence.description}</p>` : ""}
              <p style="font-size: 12px; color: #666; margin: 2px 0;">
                Raio: ${geofence.radius_meters}m
              </p>
              ${geofence.address ? `<p style="font-size: 11px; color: #999; margin-top: 4px;">${geofence.address}</p>` : ""}
            </div>
          `)
        )
        .addTo(map.current!);
    });
  };

  // Helper function to create a circle GeoJSON polygon
  const createCircleGeoJSON = (lng: number, lat: number, radiusMeters: number) => {
    const points = 64;
    const coords: number[][] = [];
    const earthRadius = 6371000; // Earth radius in meters

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radiusMeters * Math.cos(angle);
      const dy = radiusMeters * Math.sin(angle);

      const newLat = lat + (dy / earthRadius) * (180 / Math.PI);
      const newLng = lng + (dx / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

      coords.push([newLng, newLat]);
    }

    return {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords],
      },
      properties: {},
    };
  };

  // Check if a point is inside a geofence
  const isInsideGeofence = (deviceLat: number, deviceLng: number, geofence: Geofence): boolean => {
    const earthRadius = 6371000;
    const dLat = ((geofence.latitude - deviceLat) * Math.PI) / 180;
    const dLng = ((geofence.longitude - deviceLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((deviceLat * Math.PI) / 180) *
        Math.cos((geofence.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance <= geofence.radius_meters;
  };

  // Check for entry/exit alerts
  const checkGeofenceAlerts = () => {
    devices.forEach((device) => {
      if (!device.last_location_lat || !device.last_location_lng) return;

      const deviceKey = device.id;
      const prevData = prevDevicePositions.current.get(deviceKey);
      const currentInsideGeofences = new Set<string>();

      geofences.filter(g => g.is_active).forEach((geofence) => {
        const isInside = isInsideGeofence(
          device.last_location_lat!,
          device.last_location_lng!,
          geofence
        );

        if (isInside) {
          currentInsideGeofences.add(geofence.id);
        }

        if (prevData) {
          const wasInside = prevData.insideGeofences.has(geofence.id);

          // Entry alert
          if (isInside && !wasInside) {
            toast.success(`📍 ${device.employee_name} entrou na área "${geofence.name}"`, {
              duration: 5000,
            });
          }

          // Exit alert
          if (!isInside && wasInside) {
            toast.warning(`⚠️ ${device.employee_name} saiu da área "${geofence.name}"`, {
              duration: 5000,
            });
          }
        }
      });

      prevDevicePositions.current.set(deviceKey, {
        lat: device.last_location_lat!,
        lng: device.last_location_lng!,
        insideGeofences: currentInsideGeofences,
      });
    });
  };

  // Update markers when devices change
  useEffect(() => {
    if (map.current && !loading) {
      updateMarkers();
      checkGeofenceAlerts();
    }
  }, [devices, loading]);

  // Update geofences when they change
  useEffect(() => {
    if (map.current && !loading) {
      drawGeofences();
    }
  }, [geofences, loading]);

  if (error) {
    return (
      <div className="w-full h-[500px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg z-10">
        <h4 className="text-xs font-semibold text-foreground mb-2">Legenda</h4>
        <div className="space-y-2">
          {/* Device Status */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute w-3 h-3 rounded-full bg-green-500 opacity-50 animate-ping" />
            </div>
            <span className="text-xs text-muted-foreground">Dispositivo Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-xs text-muted-foreground">Dispositivo Offline</span>
          </div>
          
          {/* Device Types */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <span className="text-sm">🍎</span>
            <span className="text-xs text-muted-foreground">iOS</span>
            <span className="text-sm ml-2">🤖</span>
            <span className="text-xs text-muted-foreground">Android</span>
          </div>
          
          {/* Geofence */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <div className="w-4 h-4 rounded-full border-2 border-dashed border-green-500 bg-green-500/20" />
            <span className="text-xs text-muted-foreground">Área de Geofence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
