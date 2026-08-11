import { Printer, Usb, HardDrive, AlertTriangle, AppWindow } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/data/mockData';

const alertIcons = {
  print_attempt: Printer,
  usb_blocked: Usb,
  external_hd: HardDrive,
  suspicious_activity: AlertTriangle,
  unauthorized_app: AppWindow,
};

const severityStyles = {
  low: 'border-info/30 bg-info/5',
  medium: 'border-warning/30 bg-warning/5',
  high: 'border-orange-500/30 bg-orange-500/5',
  critical: 'border-destructive/30 bg-destructive/5',
};

const severityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

const severityColors = {
  low: 'text-info',
  medium: 'text-warning',
  high: 'text-orange-500',
  critical: 'text-destructive',
};

interface EmployeeAlertItemProps {
  alert: Alert;
}

export function EmployeeAlertItem({ alert }: EmployeeAlertItemProps) {
  const Icon = alertIcons[alert.type];

  return (
    <div className={cn(
      'flex items-start gap-4 rounded-lg border p-4',
      severityStyles[alert.severity]
    )}>
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
        alert.severity === 'critical' ? 'bg-destructive/20' :
        alert.severity === 'high' ? 'bg-orange-500/20' :
        alert.severity === 'medium' ? 'bg-warning/20' :
        'bg-info/20'
      )}>
        <Icon className={cn('h-5 w-5', severityColors[alert.severity])} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{alert.message}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dispositivo: {alert.device}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className={cn(
              'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
              alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
              alert.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
              alert.severity === 'medium' ? 'bg-warning/20 text-warning' :
              'bg-info/20 text-info'
            )}>
              {severityLabels[alert.severity]}
            </span>
            <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
