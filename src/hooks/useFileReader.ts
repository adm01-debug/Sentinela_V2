import { useState, useCallback } from "react";

export function useFileReader() {
  const [content, setContent] = useState<string | ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const readAsText = useCallback((file: File) => {
    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setContent(reader.result);
      setLoading(false);
    };
    reader.onerror = () => {
      setError(reader.error);
      setLoading(false);
    };
    reader.readAsText(file);
  }, []);

  const readAsDataURL = useCallback((file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setContent(reader.result);
      setLoading(false);
    };
    reader.onerror = () => {
      setError(reader.error);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  return { content, loading, error, readAsText, readAsDataURL };
}
