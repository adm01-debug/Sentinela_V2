import { AlertTriangle, Printer, Usb, HardDrive, Eye, AppWindow } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/data/mockData';

const alertIcons = {
  print_attempt: Printer,
  usb_blocked: Usb,
  external_hd: HardDrive,
  suspicious_activity: Eye,
  unauthorized_app: AppWindow,
};

const severityStyles = {
  low: 'border-muted bg-muted/20 text-muted-foreground',
  medium: 'border-warning/50 bg-warning/10 text-warning',
  high: 'border-destructive/50 bg-destructive/10 text-destructive',
  critical: 'border-destructive bg-destructive/20 text-destructive animate-pulse',
};

const severityBadgeStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

interface AlertItemProps {
  alert: Alert;
}

export function AlertItem({ alert }: AlertItemProps) {
  const Icon = alertIcons[alert.type];
  
  return (
    <div className={cn(
      'flex items-start gap-4 rounded-lg border p-4 transition-all duration-200 hover:scale-[1.01]',
      severityStyles[alert.severity]
    )}>
      <div className="rounded-lg bg-background/50 p-2">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">{alert.employeeName}</p>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', severityBadgeStyles[alert.severity])}>
            {alert.severity === 'critical' ? 'CRÍTICO' : alert.severity === 'high' ? 'ALTO' : alert.severity === 'medium' ? 'MÉDIO' : 'BAIXO'}
          </span>
        </div>
        <p className="text-sm text-foreground/80">{alert.message}</p>
        <p className="text-xs text-muted-foreground">{alert.device} • {alert.timestamp}</p>
      </div>
    </div>
  );
}
