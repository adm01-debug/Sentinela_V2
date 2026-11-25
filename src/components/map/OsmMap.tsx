import { useMemo, useRef, useState } from "react";
import { MapPin, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TILE_SIZE = 256;
const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 360;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const PAN_LIMIT = VIEW_WIDTH;

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

export interface OsmMapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  description?: string;
  tone?: "default" | "online" | "offline" | "activity";
}

interface OsmMapProps {
  markers: OsmMapMarker[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  zoom?: number;
  className?: string;
  ariaLabel?: string;
  tileUrl?: string;
}

const TONE_CLASS: Record<NonNullable<OsmMapMarker["tone"]>, string> = {
  default: "bg-primary text-primary-foreground",
  online: "bg-emerald-600 text-white",
  offline: "bg-muted-foreground text-white",
  activity: "bg-amber-500 text-white",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -85.05112878 &&
    latitude <= 85.05112878 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/** Projecao Web Mercator (mesma usada pelos tiles do OSM). */
export function projectToWorld(latitude: number, longitude: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const latitudeRadians = (clamp(latitude, -85.05112878, 85.05112878) * Math.PI) / 180;
  const x = ((longitude + 180) / 360) * scale;
  const y =
    ((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2) *
    scale;
  return { x, y };
}

export function unprojectFromWorld(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (x / scale) * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale)));
  return { latitude: (latitudeRadians * 180) / Math.PI, longitude };
}

/** Zoom que caberia todos os marcadores na viewport logica. */
export function fitZoom(markers: OsmMapMarker[]) {
  const valid = markers.filter((marker) => isValidCoordinate(marker.latitude, marker.longitude));
  if (valid.length < 2) return 13;

  const latitudes = valid.map((marker) => marker.latitude);
  const longitudes = valid.map((marker) => marker.longitude);
  const latitudeSpan = Math.max(...latitudes) - Math.min(...latitudes);
  const longitudeSpan = Math.max(...longitudes) - Math.min(...longitudes);

  for (let zoom = MAX_ZOOM; zoom > MIN_ZOOM; zoom -= 1) {
    const topLeft = projectToWorld(Math.max(...latitudes), Math.min(...longitudes), zoom);
    const bottomRight = projectToWorld(Math.min(...latitudes), Math.max(...longitudes), zoom);
    const fitsWidth = bottomRight.x - topLeft.x <= VIEW_WIDTH * 0.8;
    const fitsHeight = bottomRight.y - topLeft.y <= VIEW_HEIGHT * 0.8;
    if (fitsWidth && fitsHeight) return zoom;
    if (latitudeSpan === 0 && longitudeSpan === 0) return zoom;
  }

  return MIN_ZOOM;
}

export function OsmMap({
  markers,
  selectedId,
  onMarkerClick,
  zoom: zoomProp,
  className,
  ariaLabel = "Mapa",
  tileUrl = DEFAULT_TILE_URL,
}: OsmMapProps) {
  const validMarkers = useMemo(
    () => markers.filter((marker) => isValidCoordinate(marker.latitude, marker.longitude)),
    [markers]
  );

  const [zoom, setZoom] = useState(() => zoomProp ?? fitZoom(validMarkers));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null
  );

  const center = useMemo(() => {
    if (validMarkers.length === 0) return { latitude: -23.5505, longitude: -46.6333 };
    const latitude =
      validMarkers.reduce((sum, marker) => sum + marker.latitude, 0) / validMarkers.length;
    const longitude =
      validMarkers.reduce((sum, marker) => sum + marker.longitude, 0) / validMarkers.length;
    return { latitude, longitude };
  }, [validMarkers]);

  const layout = useMemo(() => {
    const centerWorld = projectToWorld(center.latitude, center.longitude, zoom);
    const originX = centerWorld.x - VIEW_WIDTH / 2 - pan.x;
    const originY = centerWorld.y - VIEW_HEIGHT / 2 - pan.y;

    const startTileX = Math.floor(originX / TILE_SIZE);
    const startTileY = Math.floor(originY / TILE_SIZE);
    const tileCount = 2 ** zoom;
    const tiles: Array<{ key: string; x: number; y: number; left: number; top: number }> = [];

    for (let column = 0; column * TILE_SIZE <= VIEW_WIDTH + TILE_SIZE; column += 1) {
      for (let row = 0; row * TILE_SIZE <= VIEW_HEIGHT + TILE_SIZE; row += 1) {
        const tileX = startTileX + column;
        const tileY = startTileY + row;
        if (row * TILE_SIZE - (originY - startTileY * TILE_SIZE) > VIEW_HEIGHT) continue;
        const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;
        if (tileY < 0 || tileY >= tileCount) continue;
        tiles.push({
          key: `${zoom}/${wrappedX}/${tileY}`,
          x: wrappedX,
          y: tileY,
          left: tileX * TILE_SIZE - originX,
          top: tileY * TILE_SIZE - originY,
        });
      }
    }

    const positioned = validMarkers.map((marker) => {
      const world = projectToWorld(marker.latitude, marker.longitude, zoom);
      return { marker, left: world.x - originX, top: world.y - originY };
    });

    return { tiles, positioned };
  }, [center.latitude, center.longitude, zoom, pan, validMarkers]);

  const zoomBy = (delta: number) => {
    setZoom((current) => clamp(current + delta, MIN_ZOOM, MAX_ZOOM));
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const nextX = clamp(drag.panX - (event.clientX - drag.startX), -PAN_LIMIT, PAN_LIMIT);
    const nextY = clamp(drag.panY - (event.clientY - drag.startY), -PAN_LIMIT, PAN_LIMIT);
    setPan({ x: nextX, y: nextY });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  if (validMarkers.length === 0) {
    return (
      <div
        className={cn(
          "bg-muted/40 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border text-center",
          className
        )}
        data-testid="osm-map-empty"
      >
        <MapPin className="text-muted-foreground h-10 w-10" aria-hidden="true" />
        <p className="text-muted-foreground text-sm">
          Nenhum ponto com localizacao para exibir no mapa.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted relative aspect-video w-full touch-none overflow-hidden rounded-lg border",
        className
      )}
      role="application"
      aria-label={ariaLabel}
      data-testid="osm-map"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {layout.tiles.map((tile) => (
        <img
          key={tile.key}
          src={tileUrl
            .replace("{z}", String(zoom))
            .replace("{x}", String(tile.x))
            .replace("{y}", String(tile.y))}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          className="pointer-events-none absolute select-none"
          data-testid="osm-map-tile"
          style={{
            left: `${(tile.left / VIEW_WIDTH) * 100}%`,
            top: `${(tile.top / VIEW_HEIGHT) * 100}%`,
            width: `${(TILE_SIZE / VIEW_WIDTH) * 100}%`,
            height: `${(TILE_SIZE / VIEW_HEIGHT) * 100}%`,
          }}
        />
      ))}

      {layout.positioned.map(({ marker, left, top }) => {
        const isSelected = marker.id === selectedId;
        return (
          <button
            key={marker.id}
            type="button"
            onClick={() => onMarkerClick?.(marker.id)}
            aria-pressed={isSelected}
            aria-label={
              marker.description ? `${marker.label} - ${marker.description}` : marker.label
            }
            title={marker.description ? `${marker.label} - ${marker.description}` : marker.label}
            data-testid="osm-map-marker"
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white text-[10px] font-medium shadow-md transition-transform",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              isSelected ? "ring-primary scale-125 ring-2 ring-offset-1" : "hover:scale-110",
              TONE_CLASS[marker.tone ?? "default"],
              marker.tone === "activity" ? "h-3 w-3" : "h-5 w-5"
            )}
            style={{
              left: `${(left / VIEW_WIDTH) * 100}%`,
              top: `${(top / VIEW_HEIGHT) * 100}%`,
            }}
          />
        );
      })}

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={() => zoomBy(1)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Aproximar"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={() => zoomBy(-1)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Afastar"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <a
        href={OSM_COPYRIGHT_URL}
        target="_blank"
        rel="noreferrer"
        className="bg-background/80 text-muted-foreground absolute right-1 bottom-1 rounded px-1 text-[10px] hover:underline"
      >
        OpenStreetMap
      </a>
    </div>
  );
}

export default OsmMap;
