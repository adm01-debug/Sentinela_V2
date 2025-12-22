import { useState, useCallback } from 'react';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, show, dismiss, success: (m: string) => show(m, 'success'), error: (m: string) => show(m, 'error') };
}
