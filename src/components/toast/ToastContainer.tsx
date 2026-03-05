import { useToastStore } from '@/stores/toastStore';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

const icons: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Info,
};

export function ToastContainer() {
  const { toasts, remove: removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div key={toast.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-background border', 
            toast.type === 'error' && 'border-destructive',
            toast.type === 'success' && 'border-green-500'
          )}>
            <Icon className={cn('h-5 w-5', 
              toast.type === 'success' && 'text-green-500',
              toast.type === 'error' && 'text-destructive'
            )} />
            <div className="flex-1">
              {toast.title && <div className="font-medium">{toast.title}</div>}
              <div className="text-sm text-muted-foreground">{toast.message}</div>
            </div>
            <button onClick={() => removeToast(toast.id)}><X className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
