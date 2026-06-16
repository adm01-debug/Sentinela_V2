import { useCallback, useRef } from "react";

export function useWorkerFn<T, R>(fn: (input: T) => R) {
  const workerRef = useRef<Worker | null>(null);

  const execute = useCallback(
    (input: T): Promise<R> => {
      return new Promise((resolve) => {
        const blob = new Blob([`onmessage=e=>postMessage((${fn.toString()})(e.data))`], {
          type: "text/javascript",
        });
        workerRef.current = new Worker(URL.createObjectURL(blob));
        workerRef.current.onmessage = (e: MessageEvent<R>) => {
          resolve(e.data);
          workerRef.current?.terminate();
        };
        workerRef.current.postMessage(input);
      });
    },
    [fn]
  );

  return { execute };
}
