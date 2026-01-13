import { useState, useCallback } from "react";

export function usePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [resolveRef, setResolveRef] = useState<((v: string | null) => void) | null>(null);

  const prompt = useCallback((defaultValue = ""): Promise<string | null> => {
    setValue(defaultValue);
    setIsOpen(true);
    
    return new Promise(resolve => {
      setResolveRef(() => resolve);
    });
  }, []);

  const confirm = useCallback(() => {
    resolveRef?.(value);
    setIsOpen(false);
  }, [resolveRef, value]);

  const cancel = useCallback(() => {
    resolveRef?.(null);
    setIsOpen(false);
  }, [resolveRef]);

  return { isOpen, value, setValue, prompt, confirm, cancel };
}
