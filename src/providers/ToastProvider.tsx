import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast { id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string; }
interface ToastContextType { toasts: Toast[]; addToast: (type: Toast['type'], message: string) => void; removeToast: (id: string) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>;
}

export const useToast = () => { const ctx = useContext(ToastContext); if (!ctx) throw new Error('useToast must be within ToastProvider'); return ctx; };
