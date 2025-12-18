import { useState } from 'react';
import { AlertTriangle, Eye, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MonitoringNoticeProps {
  text?: string;
  variant?: 'admin' | 'employee';
  dismissible?: boolean;
  className?: string;
  clickable?: boolean;
}

export function MonitoringNotice({ 
  text = 'Este dispositivo está sendo monitorado para fins de segurança corporativa.',
  variant = 'employee',
  dismissible = false,
  className,
  clickable = true
}: MonitoringNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  const isAdmin = variant === 'admin';

  const handleClick = () => {
    if (clickable && !isAdmin) {
      navigate('/monitoring-policies');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
        isAdmin 
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        clickable && !isAdmin && 'cursor-pointer hover:bg-amber-500/20',
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

      {clickable && !isAdmin && (
        <ExternalLink className="h-4 w-4 opacity-60" />
      )}

      {dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
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
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/monitoring-policies');
  };

  return (
    <div 
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 cursor-pointer"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-background/95 backdrop-blur border-amber-500/30 shadow-lg hover:bg-amber-500/10 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
          <Eye className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-xs text-amber-500">Monitoramento Ativo</p>
          <p className="text-xs text-muted-foreground">{noticeText}</p>
        </div>
        <ExternalLink className="h-3 w-3 text-amber-500 opacity-60" />
      </div>
    </div>
  );
}
