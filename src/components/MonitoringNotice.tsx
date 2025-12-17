import { useState, useEffect } from 'react';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonitoringNoticeProps {
  text?: string;
  variant?: 'admin' | 'employee';
  dismissible?: boolean;
  className?: string;
}

export function MonitoringNotice({ 
  text = 'Este dispositivo está sendo monitorado para fins de segurança corporativa.',
  variant = 'employee',
  dismissible = false,
  className
}: MonitoringNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isAdmin = variant === 'admin';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border',
        isAdmin 
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full',
        isAdmin ? 'bg-blue-500/20' : 'bg-amber-500/20'
      )}>
        {isAdmin ? (
          <Eye className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
      </div>
      
      <div className="flex-1">
        <p className={cn(
          'font-medium text-sm',
          isAdmin ? 'text-blue-300' : 'text-amber-300'
        )}>
          {isAdmin ? 'Modo Administrador' : 'Aviso de Monitoramento'}
        </p>
        <p className="text-sm opacity-80">
          {isAdmin 
            ? 'Você está visualizando dados de monitoramento dos colaboradores.'
            : text
          }
        </p>
      </div>

      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Standalone employee widget component for embedding
export function EmployeeMonitoringWidget({ 
  noticeText = 'Este dispositivo está sendo monitorado para fins de segurança corporativa.'
}: { noticeText?: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-background/95 backdrop-blur border-amber-500/30 shadow-lg">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
          <Eye className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-xs text-amber-500">Monitoramento Ativo</p>
          <p className="text-xs text-muted-foreground">{noticeText}</p>
        </div>
      </div>
    </div>
  );
}
