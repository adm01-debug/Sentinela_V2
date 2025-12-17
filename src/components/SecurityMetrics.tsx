import { Printer, Usb, HardDrive, Eye } from 'lucide-react';
import { securityMetrics } from '@/data/mockData';

const metrics = [
  { icon: Printer, label: 'Print Bloqueados', value: securityMetrics.printBlocked, color: 'text-destructive' },
  { icon: Usb, label: 'USB Bloqueados', value: securityMetrics.usbBlocked, color: 'text-warning' },
  { icon: HardDrive, label: 'HD Ext. Bloqueados', value: securityMetrics.hdBlocked, color: 'text-destructive' },
  { icon: Eye, label: 'Atividades Suspeitas', value: securityMetrics.suspiciousActivity, color: 'text-warning' },
];

export function SecurityMetrics() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Bloqueios de Segurança</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-muted p-2 ${metric.color}`}>
                <metric.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
            <span className="text-xl font-bold">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
