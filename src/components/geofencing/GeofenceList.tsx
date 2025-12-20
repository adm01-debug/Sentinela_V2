import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Circle, Hexagon, Edit, Trash2, Users } from 'lucide-react';

interface Geofence {
  id: string;
  name: string;
  type: 'polygon' | 'circle';
  color: string;
  is_active: boolean;
  restricted: boolean;
  required: boolean;
  employees_count?: number;
}

interface GeofenceListProps {
  geofences: Geofence[];
  selectedId?: string;
  onSelect: (geofence: Geofence) => void;
  onEdit: (geofence: Geofence) => void;
  onDelete: (geofence: Geofence) => void;
  onToggle: (geofence: Geofence) => void;
}

function GeofenceListComponent({
  geofences,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: GeofenceListProps) {
  if (geofences.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma geofence cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2 pr-4">
        {geofences.map((geofence) => (
          <Card
            key={geofence.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedId === geofence.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(geofence)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: geofence.color }}
                  />
                  {geofence.type === 'circle' ? (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Hexagon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{geofence.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {geofence.restricted && (
                        <Badge variant="destructive" className="text-xs">Restrita</Badge>
                      )}
                      {geofence.required && (
                        <Badge variant="default" className="text-xs">Obrigatória</Badge>
                      )}
                      {geofence.employees_count ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {geofence.employees_count}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Switch checked={geofence.is_active} />
                  <Button variant="ghost" size="icon" onClick={() => onEdit(geofence)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(geofence)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

export const GeofenceList = memo(GeofenceListComponent);
