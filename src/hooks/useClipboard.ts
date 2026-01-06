import { useState, useCallback } from 'react';
export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const copy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setError(null); setTimeout(() => setCopied(false), timeout); return true;
    } catch (e) { setError(e instanceof Error ? e : new Error('Copy failed')); return false; }
  }, [timeout]);
  const paste = useCallback(async () => {
    try { return await navigator.clipboard.readText(); } catch (e) { setError(e instanceof Error ? e : new Error('Paste failed')); return null; }
  }, []);
  return { copied, error, copy, paste };
}
export default useClipboard;
