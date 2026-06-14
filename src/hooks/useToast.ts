import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastCounter = 0;

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = String(++toastCounter);
      const newToast: Toast = { id, title, description, variant, duration };

      setState((prev) => ({
        toasts: [...prev.toasts, newToast],
      }));

      if (duration > 0) {
        setTimeout(() => {
          setState((prev) => ({
            toasts: prev.toasts.filter((t: Toast) => t.id !== id),
          }));
        }, duration);
      }

      return id;
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setState((prev) => ({
      toasts: prev.toasts.filter((t: Toast) => t.id !== id),
    }));
  }, []);

  const dismissAll = useCallback(() => {
    setState({ toasts: [] });
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    dismissAll,
  };
}

export default useToast;
