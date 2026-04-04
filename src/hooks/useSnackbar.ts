import { useState, useCallback } from "react";

interface Snackbar { id: string; message: string; type: "success" | "error" | "info"; }

export function useSnackbar(duration = 3000) {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  const show = useCallback((message: string, type: Snackbar["type"] = "info") => {
    const id = crypto.randomUUID();
    setSnackbars(prev => [...prev, { id, message, type }]);
    setTimeout(() => setSnackbars(prev => prev.filter(s => s.id !== id)), duration);
    return id;
  }, [duration]);

  const success = useCallback((msg) => show(msg, "success"), [show]);
  const error = useCallback((msg) => show(msg, "error"), [show]);
  const info = useCallback((msg) => show(msg, "info"), [show]);

  return { snackbars, show, success, error, info };
}
