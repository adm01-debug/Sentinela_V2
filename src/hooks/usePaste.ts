import { useState, useEffect, useCallback } from "react";

export function usePaste(onPaste?: (text: string) => void) {
  const [pastedText, setPastedText] = useState<string | null>(null);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text/plain") || "";
      setPastedText(text);
      onPaste?.(text);
    },
    [onPaste]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return { pastedText };
}
