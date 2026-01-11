import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string; }
interface ToastContextType { addToast: (type: Toast['type'], message: string) => void; }
const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const styles = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div key={toast.id} className={cn('flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-lg', styles[toast.type])}>
              <Icon className="h-5 w-5" />
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)}><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};