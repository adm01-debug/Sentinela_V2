import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Camera, Monitor, Globe, Keyboard, MapPin, Moon } from 'lucide-react';

interface MonitoringPolicy {
  id: string;
  name: string;
  description?: string;
  screenshot_interval: number;
  activity_tracking: boolean;
  app_tracking: boolean;
  url_tracking: boolean;
  keystroke_tracking: boolean;
  location_tracking: boolean;
  idle_detection: boolean;
  is_active: boolean;
}

interface PolicyCardProps {
  policy: MonitoringPolicy;
  onEdit: (p: MonitoringPolicy) => void;
  onDelete: (p: MonitoringPolicy) => void;
}

function PolicyCardComponent({ policy, onEdit, onDelete }: PolicyCardProps) {
  const features = [
    { enabled: policy.screenshot_interval > 0, icon: Camera, label: 'Screenshots' },
    { enabled: policy.activity_tracking, icon: Monitor, label: 'Atividade' },
    { enabled: policy.app_tracking, icon: Monitor, label: 'Apps' },
    { enabled: policy.url_tracking, icon: Globe, label: 'URLs' },
    { enabled: policy.keystroke_tracking, icon: Keyboard, label: 'Teclas' },
    { enabled: policy.location_tracking, icon: MapPin, label: 'GPS' },
    { enabled: policy.idle_detection, icon: Moon, label: 'Ociosidade' },
  ].filter(f => f.enabled);

  return (
    <Card className={!policy.is_active ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{policy.name}</CardTitle>
            {policy.description && (
              <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
            )}
          </div>
          <Badge variant={policy.is_active ? 'default' : 'secondary'}>
            {policy.is_active ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((f, i) => (
            <Badge key={i} variant="outline" className="flex items-center gap-1">
              <f.icon className="h-3 w-3" />
              {f.label}
            </Badge>
          ))}
        </div>
        {policy.screenshot_interval > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            Screenshots a cada {policy.screenshot_interval / 60} min
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(policy)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(policy)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const PolicyCard = memo(PolicyCardComponent);
