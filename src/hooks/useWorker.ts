import { useState, useCallback, useEffect, useRef } from "react";

export function useWorker<T, R>(workerFn: (data: T) => R) {
  const [result, setResult] = useState<R | null>(null);
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([`onmessage=e=>postMessage((${workerFn.toString()})(e.data))`], { type: "text/javascript" });
    workerRef.current = new Worker(URL.createObjectURL(blob));
    workerRef.current.onmessage = (e) => { setResult(e.data); setLoading(false); };
    return () => workerRef.current?.terminate();
  }, [workerFn]);

  const run = useCallback((data: T) => {
    setLoading(true);
    workerRef.current?.postMessage(data);
  }, []);

  return { result, loading, run };
}
