import { useState, useCallback } from "react";

export function useImport<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const importJSON = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as T;
      setData(parsed);
      return parsed;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const importCSV = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map(line => {
        const values = line.split(",");
        return headers.reduce((obj, h, i) => ({ ...obj, [h.trim()]: values[i]?.trim() }), {});
      });
      setData(rows as unknown as T);
      return rows as unknown as T;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, importJSON, importCSV };
}
