import { useState, useCallback } from "react";

interface Alert {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export function useAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const show = useCallback((type: Alert["type"], message: string, duration = 5000) => {
    const id = crypto.randomUUID();
    const alert: Alert = { id, type, message, duration };
    setAlerts(prev => [...prev, alert]);
    
    if (duration > 0) {
      setTimeout(() => dismiss(id: string), duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const success = useCallback((msg: string, d?: number) => show("success", msg, d), [show]);
  const error = useCallback((msg: string, d?: number) => show("error", msg, d), [show]);
  const warning = useCallback((msg: string, d?: number) => show("warning", msg, d), [show]);
  const info = useCallback((msg: string, d?: number) => show("info", msg, d), [show]);

  return { alerts, show, dismiss, success, error, warning, info };
}
