import { useState, useCallback } from 'react';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  return { toasts, show, dismiss, success: (m: string) => show(m, 'success'), error: (m: string) => show(m, 'error') };
}