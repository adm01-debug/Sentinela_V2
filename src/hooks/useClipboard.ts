import { useState, useCallback } from 'react';

export interface UseClipboardOptions {
  timeout?: number;
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000, onSuccess, onError } = options;
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setIsCopied(true);
      setError(null);
      onSuccess?.(text);
      
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
      
      return true;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Copy failed');
      setError(err);
      onError?.(err);
      return false;
    }
  }, [timeout, onSuccess, onError]);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Paste failed');
      setError(err);
      onError?.(err);
      return null;
    }
  }, [onError]);

  const reset = useCallback(() => {
    setCopiedText(null);
    setIsCopied(false);
    setError(null);
  }, []);

  return { copy, paste, copiedText, isCopied, error, reset };
}

export default useClipboard;
