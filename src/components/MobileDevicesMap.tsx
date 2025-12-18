import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MobileDevice } from "@/hooks/useMobileDevices";
import { Loader2 } from "lucide-react";

interface MobileDevicesMapProps {
  devices: MobileDevice[];
}

export function MobileDevicesMap({ devices }: MobileDevicesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      el.innerHTML = `
        <div style="
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
        ">
          ${device.os_type === "ios" ? "🍎" : "🤖"}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="color: #1a1a1a; padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${device.employee_name}</h3>
          <p style="font-size: 12px; color: #666; margin: 2px 0;">
            ${device.device_model || "Dispositivo"} • ${device.os_type.toUpperCase()}
          </p>
          <p style="font-size: 12px; color: #666; margin: 2px 0;">
            Status: <span style="color: ${device.is_active ? "#22c55e" : "#6b7280"};">
              ${device.is_active ? "Ativo" : "Inativo"}
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

  // Update markers when devices change
  useEffect(() => {
    if (map.current && !loading) {
      updateMarkers();
    }
  }, [devices, loading]);

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
    </div>
  );
}
