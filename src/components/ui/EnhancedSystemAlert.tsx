import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface SystemAlertProps {
  type?: 'info' | 'success' | 'warning' | 'error' | 'offline';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoHide?: number;
  className?: string;
}

const icons = { info: Info, success: CheckCircle, warning: AlertTriangle, error: AlertCircle, offline: WifiOff };
const variants = { info: 'default', success: 'default', warning: 'default', error: 'destructive', offline: 'default' };

export function EnhancedSystemAlert({ type = 'info', title, message, dismissible = true, onDismiss, autoHide, className }: SystemAlertProps) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => { setVisible(false); onDismiss?.(); }, autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide, visible, onDismiss]);

  if (!visible) return null;

  return (
    <Alert variant={variants[type] as any} className={cn('relative', className)}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
      {dismissible && (
        <button onClick={() => { setVisible(false); onDismiss?.(); }} className="absolute top-2 right-2 p-1 hover:bg-muted rounded">
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}
export default EnhancedSystemAlert;
