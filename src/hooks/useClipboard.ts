import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

interface UseClipboardOptions {
  timeout?: number;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
  reset: () => void;
}

// ============================================================
// useClipboard - Copy text to clipboard
// ============================================================

/**
 * Hook for copying text to clipboard with status tracking
 * @param options - Configuration options
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const {
    timeout = 2000,
    successMessage = 'Copiado!',
    errorMessage = 'Falha ao copiar',
    showToast = true,
  } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        const err = new Error('Clipboard API not supported');
        setError(err);
        if (showToast) {
          toast({
            title: errorMessage,
            description: 'Seu navegador não suporta esta funcionalidade.',
            variant: 'destructive',
          });
        }
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);

        if (showToast) {
          toast({ title: successMessage });
        }

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        setError(error);
        setCopied(false);

        if (showToast) {
          toast({
            title: errorMessage,
            description: error.message,
            variant: 'destructive',
          });
        }

        return false;
      }
    },
    [timeout, successMessage, errorMessage, showToast, toast]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { copy, copied, error, reset };
}

// ============================================================
// useCopyToClipboard - Simplified version
// ============================================================

/**
 * Simplified clipboard hook that just returns a copy function
 */
export function useCopyToClipboard(): (text: string) => Promise<boolean> {
  const { copy } = useClipboard();
  return copy;
}

// ============================================================
// useClipboardValue - Copy specific value on demand
// ============================================================

/**
 * Hook for copying a specific value
 * Useful when you have a predetermined value to copy
 */
export function useClipboardValue(value: string, options?: UseClipboardOptions) {
  const { copy, copied, error, reset } = useClipboard(options);

  const copyValue = useCallback(() => {
    return copy(value);
  }, [copy, value]);

  return { copy: copyValue, copied, error, reset };
}
