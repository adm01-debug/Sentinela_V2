import { useState, useCallback, useRef } from "react";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useFileUpload(url: string) {
  const [uploading, setUploading] = useState(false);
  const [progress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal
      });
      
      if (!response.ok) throw new Error("Upload failed");
      return await response.json();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [url]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { uploading, progress, error, upload, cancel };
}
