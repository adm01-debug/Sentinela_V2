import { Printer, Usb, HardDrive, Eye, Loader2 } from 'lucide-react';
import { useSecurityMetrics } from '@/hooks/useSecurityMetrics';

export function SecurityMetrics() {
  const { metrics, loading } = useSecurityMetrics();

  const metricItems = [
    { icon: Printer, label: 'Print Bloqueados', value: metrics.printBlocked, color: 'text-destructive' },
    { icon: Usb, label: 'USB Bloqueados', value: metrics.usbBlocked, color: 'text-warning' },
    { icon: HardDrive, label: 'HD Ext. Bloqueados', value: metrics.hdBlocked, color: 'text-destructive' },
    { icon: Eye, label: 'Atividades Suspeitas', value: metrics.suspiciousActivity, color: 'text-warning' },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Bloqueios de Segurança</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bloqueios de Segurança</h3>
        <span className="text-xs text-muted-foreground">Tempo real</span>
      </div>
      <div className="space-y-4">
        {metricItems.map((metric) => (
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
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-destructive">{metrics.criticalViolations}</p>
            <p className="text-xs text-muted-foreground">Críticas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{metrics.highViolations}</p>
            <p className="text-xs text-muted-foreground">Alta Prioridade</p>
          </div>
        </div>
      </div>
    </div>
  );
}
