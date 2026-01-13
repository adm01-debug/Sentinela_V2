import { useState, useCallback } from "react";

type Producer<T> = (draft: T) => void | T;

export function useImmer<T>(initialValue: T): [T, (producer: Producer<T>) => void] {
  const [state, setState] = useState(initialValue);

  const update = useCallback((producer: Producer<T>) => {
    setState(current => {
      const draft = JSON.parse(JSON.stringify(current));
      const result = producer(draft);
      return result !== undefined ? result : draft;
    });
  }, []);

  return [state, update];
}
