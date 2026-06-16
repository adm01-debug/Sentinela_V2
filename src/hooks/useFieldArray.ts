import { useState, useCallback } from "react";
export function useFieldArray<T>(initialItems: T[] = []) {
  const [fields, setFields] = useState<{ id: string; value: T }[]>(
    initialItems.map((v) => ({ id: crypto.randomUUID(), value: v }))
  );
  const append = useCallback(
    (value: T) => setFields((p) => [...p, { id: crypto.randomUUID(), value }]),
    []
  );
  const prepend = useCallback(
    (value: T) => setFields((p) => [{ id: crypto.randomUUID(), value }, ...p]),
    []
  );
  const insert = useCallback(
    (index: number, value: T) =>
      setFields((p) => [
        ...p.slice(0, index),
        { id: crypto.randomUUID(), value },
        ...p.slice(index),
      ]),
    []
  );
  const remove = useCallback(
    (index: number) => setFields((p) => p.filter((_, i) => i !== index)),
    []
  );
  const move = useCallback(
    (from: number, to: number) =>
      setFields((p) => {
        const n = [...p];
        const [item] = n.splice(from, 1);
        n.splice(to, 0, item);
        return n;
      }),
    []
  );
  const update = useCallback(
    (index: number, value: T) =>
      setFields((p) => p.map((f, i) => (i === index ? { ...f, value } : f))),
    []
  );
  const replace = useCallback(
    (items: T[]) => setFields(items.map((v) => ({ id: crypto.randomUUID(), value: v }))),
    []
  );
  return {
    fields,
    append,
    prepend,
    insert,
    remove,
    move,
    update,
    replace,
    swap: (a: number, b: number) =>
      setFields((p) => {
        const n = [...p];
        [n[a], n[b]] = [n[b], n[a]];
        return n;
      }),
  };
}
export default useFieldArray;
