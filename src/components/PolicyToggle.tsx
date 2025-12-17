import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Usb, HardDrive, Camera, Video, Clipboard, Globe, Download, ShieldOff } from 'lucide-react';
import type { SecurityPolicy } from '@/data/settingsData';

const policyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '1': Usb,
  '2': HardDrive,
  '3': Camera,
  '4': Video,
  '5': Clipboard,
  '6': Globe,
  '7': Download,
  '8': ShieldOff,
};

interface PolicyToggleProps {
  policy: SecurityPolicy;
  onToggle: (id: string, enabled: boolean) => void;
}

export function PolicyToggle({ policy, onToggle }: PolicyToggleProps) {
  const Icon = policyIcons[policy.id] || Usb;

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors',
      policy.enabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          policy.enabled ? 'bg-primary/20' : 'bg-muted'
        )}>
          <Icon className={cn(
            'h-5 w-5',
            policy.enabled ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        <div>
          <p className="font-medium">{policy.name}</p>
          <p className="text-sm text-muted-foreground">{policy.description}</p>
        </div>
      </div>
      <Switch
        checked={policy.enabled}
        onCheckedChange={(checked) => onToggle(policy.id, checked)}
      />
    </div>
  );
}
