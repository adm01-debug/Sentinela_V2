import { useState, useEffect } from "react";

export function useTextSelection() {
  const [selection, setSelection] = useState<string>("");

  useEffect(() => {
    const handler = () => {
      const text = window.getSelection()?.toString() || "";
      setSelection(text);
    };

    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  return selection;
}
