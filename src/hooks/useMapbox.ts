import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configurar token (deve vir de variável de ambiente)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  title?: string;
  description?: string;
  color?: string;
  type?: 'employee' | 'geofence' | 'violation';
  data?: any;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: [number, number];
  radius: number; // metros
  color?: string;
  fillOpacity?: number;
}

export interface HeatmapPoint {
  longitude: number;
  latitude: number;
  intensity?: number;
}

interface UseMapboxOptions {
  container: string;
  center?: [number, number];
  zoom?: number;
  style?: string;
  markers?: MapMarker[];
  geofences?: GeofenceZone[];
  heatmapData?: HeatmapPoint[];
  showHeatmap?: boolean;
  onClick?: (event: mapboxgl.MapMouseEvent) => void;
  onMarkerClick?: (marker: MapMarker) => void;
}

export function useMapbox(options: UseMapboxOptions) {
  const {
    container,
    center = [-49.2583, -16.6869], // Goiânia como padrão
    zoom = 12,
    style = 'mapbox://styles/mapbox/dark-v11',
    markers = [],
    geofences = [],
    heatmapData = [],
    showHeatmap = false,
    onClick,
    onMarkerClick,
  } = options;

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Token do Mapbox não configurado. Defina VITE_MAPBOX_TOKEN.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      const map = new mapboxgl.Map({
        container,
        style,
        center,
        zoom,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.on('load', () => {
        setIsLoaded(true);
        mapRef.current = map;
      });

      if (onClick) {
        map.on('click', onClick);
      }

      return () => {
        map.remove();
        mapRef.current = null;
        setIsLoaded(false);
      };
    } catch (err: any) {
      setError(err.message);
    }
  }, [container, style]);

  // Atualizar centro e zoom
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      mapRef.current.flyTo({ center, zoom, duration: 1000 });
    }
  }, [center, zoom, isLoaded]);

  // Gerenciar marcadores
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Remover marcadores antigos
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Adicionar novos marcadores
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${marker.color || '#3b82f6'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <strong>${marker.title || 'Marcador'}</strong>
          ${marker.description ? `<p style="margin: 4px 0 0; font-size: 12px;">${marker.description}</p>` : ''}
        </div>
      `);

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      el.addEventListener('click', () => {
        onMarkerClick?.(marker);
      });

      markersRef.current.push(mapboxMarker);
    });
  }, [markers, isLoaded, onMarkerClick]);

  // Gerenciar geofences (círculos)
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Remover geofences existentes
    geofences.forEach(gf => {
      if (mapRef.current?.getLayer(`geofence-${gf.id}`)) {
        mapRef.current.removeLayer(`geofence-${gf.id}`);
      }
      if (mapRef.current?.getLayer(`geofence-border-${gf.id}`)) {
        mapRef.current.removeLayer(`geofence-border-${gf.id}`);
      }
      if (mapRef.current?.getSource(`geofence-${gf.id}`)) {
        mapRef.current.removeSource(`geofence-${gf.id}`);
      }
    });

    // Adicionar novos geofences
    geofences.forEach(gf => {
      const circleGeoJSON = createCircleGeoJSON(gf.center, gf.radius);

      mapRef.current?.addSource(`geofence-${gf.id}`, {
        type: 'geojson',
        data: circleGeoJSON,
      });

      // Preenchimento
      mapRef.current?.addLayer({
        id: `geofence-${gf.id}`,
        type: 'fill',
        source: `geofence-${gf.id}`,
        paint: {
          'fill-color': gf.color || '#22c55e',
          'fill-opacity': gf.fillOpacity || 0.2,
        },
      });

      // Borda
      mapRef.current?.addLayer({
        id: `geofence-border-${gf.id}`,
        type: 'line',
        source: `geofence-${gf.id}`,
        paint: {
          'line-color': gf.color || '#22c55e',
          'line-width': 2,
        },
      });
    });
  }, [geofences, isLoaded]);

  // Heatmap
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const sourceId = 'heatmap-source';
    const layerId = 'heatmap-layer';

    // Remover existente
    if (mapRef.current.getLayer(layerId)) {
      mapRef.current.removeLayer(layerId);
    }
    if (mapRef.current.getSource(sourceId)) {
      mapRef.current.removeSource(sourceId);
    }

    if (showHeatmap && heatmapData.length > 0) {
      mapRef.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: heatmapData.map(point => ({
            type: 'Feature',
            properties: { intensity: point.intensity || 1 },
            geometry: {
              type: 'Point',
              coordinates: [point.longitude, point.latitude],
            },
          })),
        },
      });

      mapRef.current.addLayer({
        id: layerId,
        type: 'heatmap',
        source: sourceId,
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'royalblue',
            0.4, 'cyan',
            0.6, 'lime',
            0.8, 'yellow',
            1, 'red',
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.7,
        },
      });
    }
  }, [heatmapData, showHeatmap, isLoaded]);

  // Fit bounds para mostrar todos os marcadores
  const fitBounds = useCallback(() => {
    if (!mapRef.current || markers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    markers.forEach(m => bounds.extend([m.longitude, m.latitude]));
    geofences.forEach(g => bounds.extend(g.center));

    mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
  }, [markers, geofences]);

  return {
    map: mapRef.current,
    isLoaded,
    error,
    fitBounds,
  };
}

// Helper para criar GeoJSON de círculo
function createCircleGeoJSON(center: [number, number], radiusMeters: number): GeoJSON.Feature {
  const points = 64;
  const coords: [number, number][] = [];
  
  const km = radiusMeters / 1000;
  const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // Fechar o círculo

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

// Hook simplificado para mostrar localização de funcionários
export function useEmployeeLocations() {
  const [locations, setLocations] = useState<MapMarker[]>([]);

  // Em produção, isso buscaria do Supabase em tempo real
  // Por enquanto, retorna dados de exemplo
  useEffect(() => {
    // Simulação - em produção usar supabase realtime
    setLocations([]);
  }, []);

  return locations;
}
