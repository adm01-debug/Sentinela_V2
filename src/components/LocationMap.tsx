import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Users, 
  Layers, 
  Flame,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useMapbox, MapMarker, GeofenceZone, HeatmapPoint } from '@/hooks/useMapbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LocationMapProps {
  className?: string;
  height?: string;
  showControls?: boolean;
  showGeofences?: boolean;
  showEmployees?: boolean;
  showHeatmap?: boolean;
}

export function LocationMap({
  className,
  height = '500px',
  showControls = true,
  showGeofences: initialShowGeofences = true,
  showEmployees: initialShowEmployees = true,
  showHeatmap: initialShowHeatmap = false,
}: LocationMapProps) {
  const containerId = 'location-map-' + Math.random().toString(36).substr(2, 9);
  
  const [showGeofences, setShowGeofences] = useState(initialShowGeofences);
  const [showEmployees, setShowEmployees] = useState(initialShowEmployees);
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(initialShowHeatmap);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Buscar geofences
  const { data: geofencesData } = useQuery({
    queryKey: ['geofences-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Buscar localizações de dispositivos móveis
  const { data: mobileLocations, refetch: refetchLocations } = useQuery({
    queryKey: ['mobile-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_devices')
        .select('id, device_name, last_latitude, last_longitude, last_seen_at, employees(name)')
        .not('last_latitude', 'is', null)
        .not('last_longitude', 'is', null);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar violações de geofence recentes para heatmap
  const { data: violationLocations } = useQuery({
    queryKey: ['violation-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, latitude, longitude, severity')
        .eq('violation_type', 'geofence_violation')
        .not('latitude', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Preparar marcadores de funcionários
  const employeeMarkers: MapMarker[] = showEmployees
    ? (mobileLocations || [])
        .filter(loc => loc.last_latitude && loc.last_longitude)
        .map(loc => ({
          id: loc.id,
          longitude: loc.last_longitude!,
          latitude: loc.last_latitude!,
          title: loc.employees?.name || loc.device_name,
          description: `Última atualização: ${new Date(loc.last_seen_at || '').toLocaleTimeString()}`,
          color: '#3b82f6',
          type: 'employee' as const,
          data: loc,
        }))
    : [];

  // Preparar geofences
  const geofenceZones: GeofenceZone[] = showGeofences
    ? (geofencesData || []).map(gf => ({
        id: gf.id,
        name: gf.name,
        center: [gf.longitude, gf.latitude] as [number, number],
        radius: gf.radius_meters,
        color: gf.should_block ? '#ef4444' : '#22c55e',
        fillOpacity: 0.15,
      }))
    : [];

  // Preparar dados do heatmap
  const heatmapData: HeatmapPoint[] = showHeatmapLayer
    ? (violationLocations || [])
        .filter(v => v.latitude && v.longitude)
        .map(v => ({
          longitude: v.longitude!,
          latitude: v.latitude!,
          intensity: v.severity === 'critical' ? 1 : v.severity === 'high' ? 0.7 : 0.4,
        }))
    : [];

  const { isLoaded, error, fitBounds } = useMapbox({
    container: containerId,
    markers: employeeMarkers,
    geofences: geofenceZones,
    heatmapData,
    showHeatmap: showHeatmapLayer,
    onMarkerClick: setSelectedMarker,
  });

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-medium">Erro ao carregar mapa</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Localização
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchLocations()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fitBounds}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={showEmployees}
                onCheckedChange={setShowEmployees}
              />
              <Users className="h-4 w-4" />
              Funcionários ({employeeMarkers.length})
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={showGeofences}
                onCheckedChange={setShowGeofences}
              />
              <MapPin className="h-4 w-4" />
              Geofences ({geofenceZones.length})
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={showHeatmapLayer}
                onCheckedChange={setShowHeatmapLayer}
              />
              <Flame className="h-4 w-4" />
              Heatmap
            </label>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          id={containerId} 
          style={{ height, width: '100%' }}
          className="rounded-b-lg overflow-hidden"
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Info do marcador selecionado */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 bg-background border rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedMarker.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedMarker.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMarker(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
